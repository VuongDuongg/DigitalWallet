package com.example.digital_wallet.service;

import com.example.digital_wallet.exception.AccountNotActiveException;
import com.example.digital_wallet.exception.AccountNotFoundException;
import com.example.digital_wallet.exception.InsufficientBalanceException;
import com.example.digital_wallet.model.dto.LedgerEntryResponse;
import com.example.digital_wallet.model.dto.TransactionResponse;
import com.example.digital_wallet.model.dto.TransferRequest;
import com.example.digital_wallet.model.entity.BalanceSnapshot;
import com.example.digital_wallet.model.entity.LedgerEntry;
import com.example.digital_wallet.model.entity.OutboxEvent;
import com.example.digital_wallet.model.entity.Transaction;
import com.example.digital_wallet.model.entity.WalletAccount;
import com.example.digital_wallet.model.enums.AccountStatus;
import com.example.digital_wallet.model.enums.EntryType;
import com.example.digital_wallet.model.enums.OutboxStatus;
import com.example.digital_wallet.model.enums.PaymentMethod;
import com.example.digital_wallet.model.enums.TransactionStatus;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;
import com.example.digital_wallet.repository.BalanceSnapshotRepository;
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
import org.springframework.transaction.support.TransactionTemplate;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletAccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final BalanceSnapshotRepository balanceSnapshotRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final IdempotencyService idempotencyService;
    private final DistributedLockService lockService;
    private final ObjectMapper objectMapper;
    private final TransactionTemplate transactionTemplate;

    public static final String SYSTEM_ESCROW_USER_ID = "SYSTEM_ESCROW";

    /**
     * Điểm vào xử lý chuyển tiền: Kết hợp Chống trùng lặp (Idempotency) và Khóa phân tán (Distributed Lock).
     */
    public TransactionResponse transfer(TransferRequest request) {
        // 1. Chống trùng lặp & Chống giả mạo: Băm SHA-256 payload (source + target + amount)
        String payloadToHash = request.getSourceAccountId() + ":" + request.getTargetAccountId() + ":" + request.getAmount();
        idempotencyService.acquire(request.getIdempotencyKey(), payloadToHash);

        try {
            // 2. Chống Race Condition: Khóa phân tán với Redisson Watchdog (tự động gia hạn)
            // Khắc phục lỗi Self-Invocation bằng cách bọc transactionTemplate.execute()
            String lockKey = "lock:account:" + request.getSourceAccountId();
            return lockService.executeWithLock(lockKey, 3, () ->
                    transactionTemplate.execute(status -> executeTransferInsideTransaction(request))
            );
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
        PaymentMethod method = request.getPaymentMethod() != null ? request.getPaymentMethod() : PaymentMethod.VNPAY;
        Transaction transaction = Transaction.builder()
                .idempotencyKey(request.getIdempotencyKey())
                .sourceAccount(sourceAccount)
                .targetAccount(targetAccount)
                .amount(request.getAmount())
                .paymentMethod(method)
                .status(TransactionStatus.PENDING)
                .build();
        transaction = transactionRepository.save(transaction);

        // 5. Ghi nhận 2 dòng Bút toán kép bất biến (Double-Entry Ledger) qua TÀI KHOẢN TREO (SYSTEM_ESCROW)
        // Lỗ hổng rút ruột được triệt tiêu hoàn toàn: Ví B KHÔNG ĐƯỢC NHẬN TIỀN ở bước này!
        WalletAccount escrowAccount = getOrCreateSystemEscrowAccount();

        // 5.1. Dòng DEBIT (Ghi Nợ - Khóa/trừ tiền ví nguồn A)
        LedgerEntry debitSource = LedgerEntry.builder()
                .transaction(transaction)
                .account(sourceAccount)
                .entryType(EntryType.DEBIT)
                .amount(request.getAmount())
                .build();

        // 5.2. Dòng CREDIT (Ghi Có - Tạm giữ tiền vào Tài khoản Treo SYSTEM_ESCROW)
        LedgerEntry creditEscrow = LedgerEntry.builder()
                .transaction(transaction)
                .account(escrowAccount)
                .entryType(EntryType.CREDIT)
                .amount(request.getAmount())
                .build();

        ledgerEntryRepository.saveAll(List.of(debitSource, creditEscrow));

        // 6. Ghi Outbox Event vào DB (Transactional Outbox Pattern)
        PaymentProcessRequestedEvent eventPayload = PaymentProcessRequestedEvent.builder()
                .transactionId(transaction.getTransactionId())
                .idempotencyKey(transaction.getIdempotencyKey())
                .sourceAccountId(sourceAccount.getAccountId())
                .targetAccountId(targetAccount.getAccountId())
                .amount(transaction.getAmount())
                .paymentMethod(method)
                .timestamp(Instant.now())
                .build();

        String payloadJson;
        try {
            payloadJson = objectMapper.writeValueAsString(eventPayload);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Lỗi chuyển đổi Event sang JSON", e);
        }

        // Key Kafka aggregateId là sourceAccountId giúp đảm bảo thứ tự FIFO cùng partition
        OutboxEvent outboxEvent = OutboxEvent.builder()
                .aggregateType("TRANSACTION")
                .aggregateId(sourceAccount.getAccountId().toString())
                .eventType("PAYMENT_PROCESS_REQUESTED")
                .payload(payloadJson)
                .status(OutboxStatus.INIT)
                .retryCount(0)
                .build();
        outboxEventRepository.save(outboxEvent);

        log.info("Khởi tạo giao dịch chuyển tiền thành công qua Escrow: txId={}, amount={}", transaction.getTransactionId(), transaction.getAmount());

        return TransactionResponse.builder()
                .transactionId(transaction.getTransactionId())
                .idempotencyKey(transaction.getIdempotencyKey())
                .sourceAccountId(sourceAccount.getAccountId())
                .targetAccountId(targetAccount.getAccountId())
                .amount(transaction.getAmount())
                .paymentMethod(transaction.getPaymentMethod())
                .status(transaction.getStatus())
                .message("Giao dịch đang được xử lý")
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    @Transactional
    public WalletAccount getOrCreateSystemEscrowAccount() {
        return accountRepository.findByUserId(SYSTEM_ESCROW_USER_ID)
                .orElseGet(() -> accountRepository.save(WalletAccount.builder()
                        .userId(SYSTEM_ESCROW_USER_ID)
                        .currency("VND")
                        .status(AccountStatus.ACTIVE)
                        .build()));
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
                .paymentMethod(transaction.getPaymentMethod())
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

        // Tối ưu hóa hiệu năng Checkpoint/Snapshot: Nếu có Snapshot, chỉ tính các dòng phát sinh sau Snapshot
        return balanceSnapshotRepository.findLatestSnapshotByAccountId(accountId)
                .map(snapshot -> {
                    BigDecimal delta = ledgerEntryRepository.calculateBalanceDeltaSince(accountId, snapshot.getCreatedAt());
                    return snapshot.getBalance().add(delta);
                })
                .orElseGet(() -> ledgerEntryRepository.calculateCurrentBalance(accountId));
    }

    @Transactional
    public BalanceSnapshot createBalanceSnapshot(UUID accountId) {
        WalletAccount account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException("Không tìm thấy tài khoản: " + accountId));
        BigDecimal currentBalance = getBalance(accountId);
        BalanceSnapshot snapshot = BalanceSnapshot.builder()
                .account(account)
                .balance(currentBalance)
                .build();
        return balanceSnapshotRepository.save(snapshot);
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
                .paymentMethod(tx.getPaymentMethod())
                .status(tx.getStatus())
                .message(tx.getFailureReason())
                .createdAt(tx.getCreatedAt())
                .build();
    }
}
