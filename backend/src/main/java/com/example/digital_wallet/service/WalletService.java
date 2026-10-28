package com.example.digital_wallet.service;

import com.example.digital_wallet.exception.AccountNotActiveException;
import com.example.digital_wallet.exception.AccountNotFoundException;
import com.example.digital_wallet.exception.InsufficientBalanceException;
import com.example.digital_wallet.model.dto.LedgerEntryResponse;
import com.example.digital_wallet.model.dto.TransactionResponse;
import com.example.digital_wallet.model.dto.TransferRequest;
import com.example.digital_wallet.model.entity.LedgerEntry;
import com.example.digital_wallet.model.entity.OutboxEvent;
import com.example.digital_wallet.model.entity.Transaction;
import com.example.digital_wallet.model.entity.WalletAccount;
import com.example.digital_wallet.model.enums.AccountStatus;
import com.example.digital_wallet.model.enums.EntryType;
import com.example.digital_wallet.model.enums.OutboxStatus;
import com.example.digital_wallet.model.enums.TransactionStatus;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;
import com.example.digital_wallet.repository.LedgerEntryRepository;
import com.example.digital_wallet.repository.OutboxEventRepository;
import com.example.digital_wallet.repository.TransactionRepository;
import com.example.digital_wallet.repository.WalletAccountRepository;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final IdempotencyService idempotencyService;
    private final DistributedLockService lockService;
    private final ObjectMapper objectMapper;

    /**
     * Điểm vào xử lý chuyển tiền: Kết hợp Chống trùng lặp (Idempotency) và Khóa phân tán (Distributed Lock).
     */
    public TransactionResponse transfer(TransferRequest request) {
        // 1. Chống trùng lặp: Chiếm quyền Idempotency Key trên Redis (TTL 120s)
        idempotencyService.acquire(request.getIdempotencyKey());

        try {
            // 2. Chống Race Condition: Khóa phân tán đúng tài khoản nguồn trong 3s
            String lockKey = "lock:account:" + request.getSourceAccountId();
            return lockService.executeWithLock(lockKey, 3, 5, () -> executeTransferInsideTransaction(request));
        } catch (Exception ex) {
            // Nếu có lỗi xảy ra trước khi commit DB thành công, giải phóng key để cho phép retry
            if (!(ex instanceof InsufficientBalanceException)) {
                idempotencyService.release(request.getIdempotencyKey());
            }
            throw ex;
        }
    }

    /**
     * Thực thi ACID Transaction: Ghi Transaction, LedgerEntries và OutboxEvent cùng 1 lúc.
     */
    @Transactional
    public TransactionResponse executeTransferInsideTransaction(TransferRequest request) {
        if (request.getSourceAccountId().equals(request.getTargetAccountId())) {
            throw new IllegalArgumentException("Tài khoản nguồn và tài khoản đích không được trùng nhau");
        }

        // 1. Kiểm tra tài khoản nguồn
        WalletAccount sourceAccount = accountRepository.findById(request.getSourceAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy tài khoản nguồn: " + request.getSourceAccountId()));

        if (sourceAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("Tài khoản nguồn đang bị khóa hoặc không hoạt động");
        }

        // 2. Kiểm tra tài khoản đích
        WalletAccount targetAccount = accountRepository.findById(request.getTargetAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy tài khoản đích: " + request.getTargetAccountId()));

        if (targetAccount.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("Tài khoản đích đang bị khóa hoặc không hoạt động");
        }

        // 3. Kiểm tra số dư khả dụng thực tế từ Sổ cái (Double-Entry Bookkeeping)
        BigDecimal currentBalance = ledgerEntryRepository.calculateCurrentBalance(sourceAccount.getAccountId());
        if (currentBalance.compareTo(request.getAmount()) < 0) {
            throw new InsufficientBalanceException("Số dư không đủ. Hiện có: " + currentBalance + ", cần chuyển: " + request.getAmount());
        }

        // 4. Lưu Bản ghi Giao dịch Master (PENDING)
        Transaction transaction = Transaction.builder()
                .idempotencyKey(request.getIdempotencyKey())
                .sourceAccount(sourceAccount)
                .targetAccount(targetAccount)
                .amount(request.getAmount())
                .status(TransactionStatus.PENDING)
                .build();
        transaction = transactionRepository.save(transaction);

        // 5. Ghi nhận 2 dòng Bút toán kép bất biến (Double-Entry Ledger)
        // 5.1. Dòng DEBIT (Ghi Nợ - Giảm tiền ví nguồn)
        LedgerEntry debitEntry = LedgerEntry.builder()
                .transaction(transaction)
                .account(sourceAccount)
                .entryType(EntryType.DEBIT)
                .amount(request.getAmount())
                .build();
        ledgerEntryRepository.save(debitEntry);

        // 5.2. Dòng CREDIT (Ghi Có - Tăng tiền ví đích)
        LedgerEntry creditEntry = LedgerEntry.builder()
                .transaction(transaction)
                .account(targetAccount)
                .entryType(EntryType.CREDIT)
                .amount(request.getAmount())
                .build();
        ledgerEntryRepository.save(creditEntry);

        // 6. Ghi Outbox Event vào DB (Transactional Outbox Pattern)
        PaymentProcessRequestedEvent eventPayload = PaymentProcessRequestedEvent.builder()
                .transactionId(transaction.getTransactionId())
                .idempotencyKey(transaction.getIdempotencyKey())
                .sourceAccountId(sourceAccount.getAccountId())
                .targetAccountId(targetAccount.getAccountId())
                .amount(transaction.getAmount())
                .timestamp(Instant.now())
                .build();

        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(eventPayload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi chuyển đổi Event sang JSON", e);
        }

        OutboxEvent outboxEvent = OutboxEvent.builder()
                .aggregateType("TRANSACTION")
                .aggregateId(transaction.getTransactionId().toString())
                .eventType("PAYMENT_PROCESS_REQUESTED")
                .payload(payloadJson)
                .status(OutboxStatus.INIT)
                .retryCount(0)
                .build();
        outboxEventRepository.save(outboxEvent);

        log.info("Khởi tạo giao dịch chuyển tiền thành công: txId={}, amount={}", transaction.getTransactionId(), transaction.getAmount());

        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .idempotencyKey(transaction.getIdempotencyKey())
                .sourceAccountId(sourceAccount.getAccountId())
                .targetAccountId(targetAccount.getAccountId())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .message("Giao dịch đang được xử lý")
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    @Transactional
    public WalletAccount createAccount(com.example.digital_wallet.model.dto.CreateAccountRequest request) {
        if (accountRepository.existsByUserId(request.getUserId())) {
            throw new IllegalArgumentException("Người dùng đã có tài khoản ví: " + request.getUserId());
        }

        WalletAccount account = WalletAccount.builder()
                .userId(request.getUserId())
                .currency(request.getCurrency() != null ? request.getCurrency() : "VND")
                .status(AccountStatus.ACTIVE)
                .build();
        return accountRepository.save(account);
    }

    @Transactional
    public TransactionResponse deposit(com.example.digital_wallet.model.dto.DepositRequest request) {
        WalletAccount account = accountRepository.findById(request.getAccountId())
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy tài khoản: " + request.getAccountId()));

        if (account.getStatus() != AccountStatus.ACTIVE) {
            throw new AccountNotActiveException("Tài khoản đang bị khóa hoặc không hoạt động");
        }

        Transaction transaction = Transaction.builder()
                .idempotencyKey("deposit-" + UUID.randomUUID())
                .targetAccount(account)
                .amount(request.getAmount())
                .status(TransactionStatus.COMPLETED)
                .build();
        transaction = transactionRepository.save(transaction);

        // Ghi bút toán CREDIT vào sổ cái
        LedgerEntry creditEntry = LedgerEntry.builder()
                .transaction(transaction)
                .account(account)
                .entryType(EntryType.CREDIT)
                .amount(request.getAmount())
                .build();
        ledgerEntryRepository.save(creditEntry);

        log.info("Nạp tiền thành công: accountId={}, amount={}", account.getAccountId(), request.getAmount());

        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .targetAccountId(account.getAccountId())
                .amount(transaction.getAmount())
                .status(transaction.getStatus())
                .message("Nạp tiền thành công")
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(UUID accountId) {
        if (!accountRepository.existsById(accountId)) {
            throw new AccountNotFoundException("Không tìm thấy tài khoản: " + accountId);
        }
        return ledgerEntryRepository.calculateCurrentBalance(accountId);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<LedgerEntryResponse> getLedgerHistory(UUID accountId, org.springframework.data.domain.Pageable pageable) {
        if (!accountRepository.existsById(accountId)) {
            throw new AccountNotFoundException("Không tìm thấy tài khoản: " + accountId);
        }
        return ledgerEntryRepository.findByAccount_AccountIdOrderByCreatedAtDesc(accountId, pageable)
                .map(entry -> LedgerEntryResponse.builder()
                        .entryId(entry.getEntryId())
                        .transactionId(entry.getTransaction() != null ? entry.getTransaction().getTransactionId() : null)
                        .accountId(entry.getAccount() != null ? entry.getAccount().getAccountId() : null)
                        .entryType(entry.getEntryType())
                        .amount(entry.getAmount())
                        .createdAt(entry.getCreatedAt())
                        .build());
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(UUID transactionId) {
        Transaction tx = transactionRepository.findById(transactionId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy giao dịch: " + transactionId));
        return TransactionResponse.builder()
                .transactionId(tx.getTransactionId())
                .idempotencyKey(tx.getIdempotencyKey())
                .sourceAccountId(tx.getSourceAccount() != null ? tx.getSourceAccount().getAccountId() : null)
                .targetAccountId(tx.getTargetAccount() != null ? tx.getTargetAccount().getAccountId() : null)
                .amount(tx.getAmount())
                .status(tx.getStatus())
                .message(tx.getFailureReason())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
