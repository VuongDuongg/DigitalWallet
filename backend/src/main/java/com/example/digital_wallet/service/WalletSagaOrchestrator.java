package com.example.digital_wallet.service;

import com.example.digital_wallet.model.entity.LedgerEntry;
import com.example.digital_wallet.model.entity.Transaction;
import com.example.digital_wallet.model.enums.EntryType;
import com.example.digital_wallet.model.enums.TransactionStatus;
import com.example.digital_wallet.model.event.PaymentProcessCompletedEvent;
import com.example.digital_wallet.model.event.PaymentProcessFailedEvent;
import com.example.digital_wallet.repository.LedgerEntryRepository;
import com.example.digital_wallet.repository.TransactionRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletSagaOrchestrator {

    private final TransactionRepository transactionRepository;
    private final LedgerEntryRepository ledgerEntryRepository;
    private final IdempotencyService idempotencyService;
    private final ObjectMapper objectMapper;

    /**
     * 1. KỊCH BẢN THÀNH CÔNG: Nhận sự kiện từ topic 'payment.process.completed'
     */
    @KafkaListener(topics = "payment.process.completed", groupId = "wallet-saga-group")
    public void onPaymentCompleted(String payload) {
        log.info("Saga Orchestrator nhận sự kiện PAYMENT_COMPLETED từ Kafka: payload={}", payload);

        try {
            PaymentProcessCompletedEvent event = objectMapper.readValue(payload, PaymentProcessCompletedEvent.class);
            processSuccessfulTransaction(event);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện PAYMENT_COMPLETED: {}", e.getMessage(), e);
        }
    }

    /**
     * Chốt giao dịch thành công (Commit Transaction):
     * Cập nhật status PENDING -> COMPLETED.
     */
    @Transactional
    public void processSuccessfulTransaction(PaymentProcessCompletedEvent event) {
        Transaction transaction = transactionRepository.findById(event.getTransactionId()).orElse(null);

        if (transaction == null) {
            log.warn("Không tìm thấy giao dịch với ID: {}", event.getTransactionId());
            return;
        }

        // Idempotent Consumer: Nếu giao dịch đã được xử lý xong từ trước thì bỏ qua
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            log.warn("Giao dịch txId={} đã ở trạng thái {}, bỏ qua xử lý lặp",
                    transaction.getTransactionId(), transaction.getStatus());
            return;
        }

        // 1. Cập nhật trạng thái giao dịch sang COMPLETED
        transaction.setStatus(TransactionStatus.COMPLETED);
        transactionRepository.save(transaction);

        // 2. Cập nhật cache Idempotency trong Redis để phản hồi nhanh nếu client gọi lại
        idempotencyService.complete(transaction.getIdempotencyKey(), "COMPLETED");

        log.info("Saga Orchestrator: Giao dịch txId={} đã HOÀN TẤT THÀNH CÔNG (COMPLETED)!", transaction.getTransactionId());
    }

    /**
     * 2. KỊCH BẢN THẤT BẠI: Nhận sự kiện từ topic 'payment.process.failed'
     */
    @KafkaListener(topics = "payment.process.failed", groupId = "wallet-saga-group")
    public void onPaymentFailed(String payload) {
        log.warn("Saga Orchestrator nhận sự kiện PAYMENT_FAILED từ Kafka: payload={}", payload);

        try {
            PaymentProcessFailedEvent event = objectMapper.readValue(payload, PaymentProcessFailedEvent.class);
            processCompensatingTransaction(event);
        } catch (Exception e) {
            log.error("Lỗi khi xử lý sự kiện PAYMENT_FAILED: {}", e.getMessage(), e);
        }
    }

    /**
     * KÍCH HOẠT BÚT TOÁN BÙ TRỪ (Compensating Transaction / Reverse Entry):
     * - Cập nhật status PENDING -> FAILED
     * - Ghi nhận lý do thất bại (failureReason)
     * - Tạo 2 dòng bút toán đảo chiều (Reverse Ledger Entries) để hoàn trả tiền về ví nguồn nguyên vẹn!
     */
    @Transactional
    public void processCompensatingTransaction(PaymentProcessFailedEvent event) {
        Transaction transaction = transactionRepository.findById(event.getTransactionId()).orElse(null);

        if (transaction == null) {
            log.warn("Không tìm thấy giao dịch với ID: {}", event.getTransactionId());
            return;
        }

        // Idempotent Consumer: Đảm bảo không hoàn tiền 2 lần
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            log.warn("Giao dịch txId={} đã ở trạng thái {}, bỏ qua bù trừ lặp",
                    transaction.getTransactionId(), transaction.getStatus());
            return;
        }

        // 1. Chuyển trạng thái giao dịch sang FAILED và lưu nguyên nhân lỗi
        transaction.setStatus(TransactionStatus.FAILED);
        transaction.setFailureReason(event.getReason());
        transactionRepository.save(transaction);

        // 2. KÍCH HOẠT BÚT TOÁN BÙ TRỪ TRÊN SỔ CÁI KÉP (Compensating Ledger Entries):
        // Tuyệt đối không xóa dòng cũ. Ghi thêm 2 dòng đảo ngược để triệt tiêu:
        
        // 2.1. Dòng CREDIT hoàn tiền lại cho ví nguồn (Source Account)
        LedgerEntry refundCreditSource = LedgerEntry.builder()
                .transaction(transaction)
                .account(transaction.getSourceAccount())
                .entryType(EntryType.CREDIT) // Cộng lại tiền đã trừ tạm tính
                .amount(transaction.getAmount())
                .build();
        ledgerEntryRepository.save(refundCreditSource);

        // 2.2. Dòng DEBIT thu hồi lại từ ví đích (Target Account)
        LedgerEntry reverseDebitTarget = LedgerEntry.builder()
                .transaction(transaction)
                .account(transaction.getTargetAccount())
                .entryType(EntryType.DEBIT) // Trừ lại tiền tạm ghi có
                .amount(transaction.getAmount())
                .build();
        ledgerEntryRepository.save(reverseDebitTarget);

        // 3. Đánh dấu Idempotency trong Redis là FAILED
        idempotencyService.complete(transaction.getIdempotencyKey(), "FAILED: " + event.getReason());

        log.warn("Saga Orchestrator: Đã thực thi Bút toán bù trừ thành công cho txId={}! Hoàn tiền {} VND về ví nguồn {}",
                transaction.getTransactionId(), transaction.getAmount(), transaction.getSourceAccount().getAccountId());
    }
}
