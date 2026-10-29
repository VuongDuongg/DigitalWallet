package com.example.digital_wallet.controller;

import com.example.digital_wallet.model.dto.PaymentCallbackRequest;
import com.example.digital_wallet.model.entity.Transaction;
import com.example.digital_wallet.model.enums.TransactionStatus;
import com.example.digital_wallet.model.event.PaymentProcessCompletedEvent;
import com.example.digital_wallet.model.event.PaymentProcessFailedEvent;
import com.example.digital_wallet.repository.TransactionRepository;
import com.example.digital_wallet.util.HmacUtils;
import com.example.digital_wallet.worker.PaymentIntegrationWorker;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/v1/callbacks")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final TransactionRepository transactionRepository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    @Value("${payment.gateway.vnpay-secret-key:vnpay-secret-key-super-secure}")
    private String vnpaySecretKey;

    @Value("${payment.gateway.momo-secret-key:momo-secret-key-super-secure}")
    private String momoSecretKey;

    /**
     * Endpoint nhận Webhook / IPN từ VNPay có xác thực chữ ký số HMAC-SHA256.
     */
    @PostMapping("/vnpay")
    public ResponseEntity<Map<String, Object>> handleVnPayCallback(@Valid @RequestBody PaymentCallbackRequest request) {
        log.info("Nhận Webhook từ VNPay: txId={}, status={}", request.getTransactionId(), request.getStatus());
        return processGatewayCallback(request, vnpaySecretKey, "VNPAY");
    }

    /**
     * Endpoint nhận Webhook / IPN từ MoMo có xác thực chữ ký số HMAC-SHA256.
     */
    @PostMapping("/momo")
    public ResponseEntity<Map<String, Object>> handleMomoCallback(@Valid @RequestBody PaymentCallbackRequest request) {
        log.info("Nhận Webhook từ MoMo: txId={}, status={}", request.getTransactionId(), request.getStatus());
        return processGatewayCallback(request, momoSecretKey, "MOMO");
    }

    /**
     * Xử lý xác thực chữ ký số HMAC-SHA256 và định tuyến sự kiện với Partition Key = sourceAccountId.
     */
    private ResponseEntity<Map<String, Object>> processGatewayCallback(
            PaymentCallbackRequest request, String secretKey, String gatewayName) {

        // 1. CHỐNG WEBHOOK SPOOFING: Kiểm tra tính toàn vẹn và xác thực chữ ký số HMAC-SHA256
        String canonicalString = request.toCanonicalString();
        boolean isValidSignature = HmacUtils.verifyHmacSha256(canonicalString, secretKey, request.getSignature());

        if (!isValidSignature) {
            log.error("CẢNH BÁO AN NINH: Phát hiện tấn công giả mạo Webhook ({})! txId={}, canonical={}, signature={}",
                    gatewayName, request.getTransactionId(), canonicalString, request.getSignature());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                    "status", "ERROR",
                    "code", "INVALID_SIGNATURE",
                    "message", "Chữ ký số không hợp lệ - Yêu cầu bị từ chối do nghi vấn giả mạo!"
            ));
        }

        // 2. Tra cứu giao dịch trong hệ thống
        Transaction transaction = transactionRepository.findById(request.getTransactionId()).orElse(null);
        if (transaction == null) {
            log.warn("Webhook tham chiếu giao dịch không tồn tại: txId={}", request.getTransactionId());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "status", "ERROR",
                    "message", "Giao dịch không tồn tại"
            ));
        }

        // 3. Tính Idempotent cho Webhook: Nếu giao dịch đã kết thúc (COMPLETED/FAILED), trả về OK để cổng ngừng retry
        if (transaction.getStatus() != TransactionStatus.PENDING) {
            log.info("Webhook nhận kết quả cho giao dịch đã kết thúc (status={}): txId={}",
                    transaction.getStatus(), transaction.getTransactionId());
            return ResponseEntity.ok(Map.of(
                    "status", "SUCCESS",
                    "message", "Giao dịch đã được cập nhật trước đó"
            ));
        }

        // 4. Định tuyến sự kiện vào Kafka với Partition Key = sourceAccountId để bảo đảm thứ tự FIFO
        String partitionKey = transaction.getSourceAccount() != null
                ? transaction.getSourceAccount().getAccountId().toString()
                : transaction.getTransactionId().toString();

        try {
            if ("SUCCESS".equalsIgnoreCase(request.getStatus())) {
                PaymentProcessCompletedEvent event = PaymentProcessCompletedEvent.builder()
                        .transactionId(transaction.getTransactionId())
                        .idempotencyKey(transaction.getIdempotencyKey())
                        .amount(transaction.getAmount())
                        .partnerTransactionId(request.getPartnerTransactionId())
                        .timestamp(Instant.now())
                        .build();

                String payload = objectMapper.writeValueAsString(event);
                kafkaTemplate.send(PaymentIntegrationWorker.TOPIC_PAYMENT_COMPLETED, partitionKey, payload);
                log.info("Webhook đẩy sự kiện PAYMENT_COMPLETED lên Kafka với partitionKey={}", partitionKey);
            } else {
                PaymentProcessFailedEvent event = PaymentProcessFailedEvent.builder()
                        .transactionId(transaction.getTransactionId())
                        .idempotencyKey(transaction.getIdempotencyKey())
                        .amount(transaction.getAmount())
                        .reason(request.getMessage() != null ? request.getMessage() : "Đối tác báo giao dịch thất bại")
                        .timestamp(Instant.now())
                        .build();

                String payload = objectMapper.writeValueAsString(event);
                kafkaTemplate.send(PaymentIntegrationWorker.TOPIC_PAYMENT_FAILED, partitionKey, payload);
                log.warn("Webhook đẩy sự kiện PAYMENT_FAILED lên Kafka với partitionKey={}", partitionKey);
            }
        } catch (JsonProcessingException e) {
            log.error("Lỗi tuần tự hóa JSON sự kiện từ Webhook", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "status", "ERROR",
                    "message", "Lỗi nội bộ hệ thống khi xử lý Webhook"
            ));
        }

        return ResponseEntity.ok(Map.of(
                "status", "SUCCESS",
                "message", "Xác thực chữ ký hợp lệ và tiếp nhận xử lý callback thành công"
        ));
    }
}

