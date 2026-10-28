package com.example.digital_wallet.worker;

import com.example.digital_wallet.client.ExternalPaymentGatewayClient;
import com.example.digital_wallet.model.dto.PartnerPaymentResponse;
import com.example.digital_wallet.model.event.PaymentProcessCompletedEvent;
import com.example.digital_wallet.model.event.PaymentProcessFailedEvent;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentIntegrationWorker {

    private final ExternalPaymentGatewayClient gatewayClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;

    public static final String TOPIC_PAYMENT_COMPLETED = "payment.process.completed";
    public static final String TOPIC_PAYMENT_FAILED = "payment.process.failed";

    /**
     * Lắng nghe sự kiện từ topic 'payment.process.requested' và tiến hành gọi đối tác.
     */
    @KafkaListener(topics = "payment.process.requested", groupId = "payment-worker-group")
    public void handlePaymentRequest(String payload) {
        log.info("Payment Worker nhận được sự kiện thanh toán từ Kafka: payload={}", payload);

        PaymentProcessRequestedEvent event;
        try {
            event = objectMapper.readValue(payload, PaymentProcessRequestedEvent.class);
        } catch (Exception e) {
            log.error("Không thể giải mã payload từ Kafka: {}", payload, e);
            return; // Tránh loop poison pill
        }

        PartnerPaymentResponse partnerResponse;
        try {
            // Gọi Cổng đối tác bên ngoài (được bảo vệ bởi CircuitBreaker & Retry)
            partnerResponse = gatewayClient.processPayment(event);
        } catch (Exception e) {
            log.error("Lỗi ngoại lệ chưa xử lý khi gọi cổng thanh toán: {}", e.getMessage());
            partnerResponse = PartnerPaymentResponse.builder()
                    .success(false)
                    .message("Lỗi kết nối cổng thanh toán: " + e.getMessage())
                    .build();
        }

        try {
            String messageKey = event.getTransactionId().toString();

            if (partnerResponse.isSuccess()) {
                // Kịch bản Thành công -> Bắn vào topic: payment.process.completed
                PaymentProcessCompletedEvent completedEvent = PaymentProcessCompletedEvent.builder()
                        .transactionId(event.getTransactionId())
                        .idempotencyKey(event.getIdempotencyKey())
                        .amount(event.getAmount())
                        .partnerTransactionId(partnerResponse.getPartnerTransactionId())
                        .timestamp(Instant.now())
                        .build();

                String completedJson = objectMapper.writeValueAsString(completedEvent);
                kafkaTemplate.send(TOPIC_PAYMENT_COMPLETED, messageKey, completedJson);
                log.info("Bắn sự kiện payment.process.completed thành công cho txId={}", event.getTransactionId());
            } else {
                // Kịch bản Thất bại -> Bắn vào topic: payment.process.failed
                PaymentProcessFailedEvent failedEvent = PaymentProcessFailedEvent.builder()
                        .transactionId(event.getTransactionId())
                        .idempotencyKey(event.getIdempotencyKey())
                        .amount(event.getAmount())
                        .reason(partnerResponse.getMessage())
                        .timestamp(Instant.now())
                        .build();

                String failedJson = objectMapper.writeValueAsString(failedEvent);
                kafkaTemplate.send(TOPIC_PAYMENT_FAILED, messageKey, failedJson);
                log.warn("Bắn sự kiện payment.process.failed thành công cho txId={}, reason={}",
                        event.getTransactionId(), partnerResponse.getMessage());
            }
        } catch (Exception e) {
            log.error("Lỗi khi bắn sự kiện kết quả thanh toán lên Kafka: {}", e.getMessage(), e);
        }
    }
}
