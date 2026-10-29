package com.example.digital_wallet.service;

import com.example.digital_wallet.model.entity.LedgerEntry;
import com.example.digital_wallet.model.entity.Transaction;
import com.example.digital_wallet.model.entity.WalletAccount;
import com.example.digital_wallet.model.enums.EntryType;
import com.example.digital_wallet.model.enums.TransactionStatus;
import com.example.digital_wallet.model.event.PaymentProcessCompletedEvent;
import com.example.digital_wallet.model.event.PaymentProcessFailedEvent;
import com.example.digital_wallet.repository.LedgerEntryRepository;
import com.example.digital_wallet.repository.TransactionRepository;
import com.example.digital_wallet.repository.WalletAccountRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletSagaOrchestrator {

    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final WalletAccountRepository accountRepository;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "payment.process.completed", groupId = "wallet-saga-group")
    @Transactional
    public void onPaymentCompleted(String payload) {
        log.info("Saga Orchestrator nhận sự kiện PAYMENT_COMPLETED: payload={}", payload);

        PaymentProcessCompletedEvent event;
        try {
            event = objectMapper.readValue(payload, PaymentProcessCompletedEvent.class);
        } catch (Exception e) {
            log.error("Lỗi Poison Pill: Không thể parse JSON sự kiện hoàn tất, bỏ qua message: {}", payload, e);
            return;
        }

        // Khóa bi quan (SELECT ... FOR UPDATE) ngăn chặn luồng khác can thiệp cùng lúc
        Transaction transaction = transactionRepository.findByIdForUpdate(event.getTransactionId()).orElse(null);
        if (transaction == null || transaction.getStatus() != TransactionStatus.PENDING) {
            log.warn("Bỏ qua giao dịch không tồn tại hoặc đã được xử lý xong: txId={}", event.getTransactionId());
            return;
        }

        // 1. Cập nhật trạng thái COMPLETED
        transaction.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(transaction);

        // 2. Chuyển tiền từ Tài khoản Treo (SYSTEM_ESCROW) sang Ví Đích B
        // LÚC NÀY VÍ B MỚI CHÍNH THỨC CÓ TIỀN VÀ ĐƯỢC TIÊU!
        WalletAccount escrowAccount = accountRepository.findByUserId(WalletService.SYSTEM_ESCROW_USER_ID)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản SYSTEM_ESCROW"));

        List<LedgerEntry> completionEntries = new ArrayList<>();

        // 2.1. DEBIT Tài khoản Treo (Giải phóng tiền treo)
        completionEntries.add(LedgerEntry.builder()
                .transaction(transaction)
                .account(escrowAccount)
                .entryType(EntryType.DEBIT)
                .amount(transaction.getAmount())
                .build());

        // 2.2. CREDIT Ví đích B (Ví B chính thức nhận tiền)
        if (transaction.getTargetAccount() != null) {
            completionEntries.add(LedgerEntry.builder()
                    .transaction(transaction)
                    .account(transaction.getTargetAccount())
                    .entryType(EntryType.CREDIT)
                    .amount(transaction.getAmount())
                    .build());
        }

        ledgerEntryRepository.saveAll(completionEntries);

        // 3. Cập nhật Idempotency
        idempotencyService.complete(transaction.getIdempotencyKey(), "COMPLETED");
        log.info("Giao dịch txId={} đã HOÀN TẤT THÀNH CÔNG! Tiền đã chuyển từ Escrow sang ví đích {}",
                transaction.getTransactionId(), transaction.getTargetAccount() != null ? transaction.getTargetAccount().getAccountId() : "N/A");
    }

    @KafkaListener(topics = "payment.process.failed", groupId = "wallet-saga-group")
    @Transactional
    public void onPaymentFailed(String payload) {
        log.warn("Saga Orchestrator nhận sự kiện PAYMENT_FAILED: payload={}", payload);

        PaymentProcessFailedEvent event;
        try {
            event = objectMapper.readValue(payload, PaymentProcessFailedEvent.class);
        } catch (Exception e) {
            log.error("Lỗi Poison Pill: Không thể parse JSON sự kiện thất bại, bỏ qua message: {}", payload, e);
            return;
        }

        // Khóa bi quan (SELECT ... FOR UPDATE) để chống hoàn tiền 2 lần khi Kafka re-delivery
        Transaction transaction = transactionRepository.findByIdForUpdate(event.getTransactionId()).orElse(null);
        if (transaction == null || transaction.getStatus() != TransactionStatus.PENDING) {
            log.warn("Bỏ qua bù trừ lặp cho giao dịch không ở trạng thái PENDING: txId={}", event.getTransactionId());
            return;
        }

        // 1. Cập nhật trạng thái FAILED
        transaction.setStatus(TransactionStatus.FAILED);
        transaction.setFailureReason(event.getReason());
        transactionRepository.save(transaction);

        // 2. Kích hoạt Bút toán bù trừ: Hoàn trả tiền từ Tài khoản Treo (SYSTEM_ESCROW) về lại Ví Nguồn A
        // CHÚ Ý: VÍ B KHÔNG BỊ ĐỤNG TỚI, SỐ DƯ VÍ B KHÔNG BAO GIỜ BỊ ÂM!
        WalletAccount escrowAccount = accountRepository.findByUserId(WalletService.SYSTEM_ESCROW_USER_ID)
                .orElseThrow(() -> new IllegalStateException("Không tìm thấy tài khoản SYSTEM_ESCROW"));

        List<LedgerEntry> compensatingEntries = new ArrayList<>();

        // 2.1. DEBIT Tài khoản Treo (Rút tiền ra khỏi Escrow)
        compensatingEntries.add(LedgerEntry.builder()
                .transaction(transaction)
                .account(escrowAccount)
                .entryType(EntryType.DEBIT)
                .amount(transaction.getAmount())
                .build());

        // 2.2. CREDIT Ví Nguồn A (Hoàn tiền nguyên vẹn về ví A)
        if (transaction.getSourceAccount() != null) {
            compensatingEntries.add(LedgerEntry.builder()
                    .transaction(transaction)
                    .account(transaction.getSourceAccount())
                    .entryType(EntryType.CREDIT)
                    .amount(transaction.getAmount())
                    .build());
        }

        ledgerEntryRepository.saveAll(compensatingEntries);

        // 3. Cập nhật Redis Idempotency
        idempotencyService.complete(transaction.getIdempotencyKey(), "FAILED: " + event.getReason());
        log.warn("Đã thực hiện xong Bút toán bù trừ qua Escrow, hoàn lại {} VND về ví nguồn {}",
                transaction.getAmount(), transaction.getSourceAccount() != null ? transaction.getSourceAccount().getAccountId() : "N/A");
    }
}
