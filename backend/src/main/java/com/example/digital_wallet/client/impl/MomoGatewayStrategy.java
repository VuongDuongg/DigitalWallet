package com.example.digital_wallet.client.impl;

import com.example.digital_wallet.client.PaymentGatewayStrategy;
import com.example.digital_wallet.model.dto.PartnerPaymentResponse;
import com.example.digital_wallet.model.enums.PaymentMethod;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.net.SocketTimeoutException;
import java.util.UUID;

@Slf4j
@Component
public class MomoGatewayStrategy implements PaymentGatewayStrategy {

    private static final String SERVICE_NAME = "paymentGateway";

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.MOMO;
    }

    @Override
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "processPaymentFallback")
    @Retry(name = SERVICE_NAME)
    public PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws SocketTimeoutException {
        log.info("[MoMo Strategy] Đang gọi Cổng MoMo (QR Code / MiniApp) cho giao dịch txId={}, amount={}",
                event.getTransactionId(), event.getAmount());

        // Kịch bản test:
        // 1. Số tiền 777,777 VND: Giả lập lỗi ví MoMo chưa liên kết ngân hàng / không đủ hạn mức
        if (event.getAmount().compareTo(new BigDecimal("777777.00")) == 0) {
            log.warn("[MoMo Strategy] MoMo từ chối giao dịch txId={}: Ví MoMo chưa xác thực eKYC hoặc hết hạn mức ngày",
                    event.getTransactionId());
            return PartnerPaymentResponse.builder()
                    .success(false)
                    .message("MoMo từ chối: Ví MoMo chưa xác thực eKYC hoặc vượt hạn mức chi tiêu trong ngày")
                    .build();
        }

        // 2. Mặc định: Thanh toán MoMo thành công
        String partnerTxId = "MOMO-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[MoMo Strategy] Thanh toán MoMo thành công: partnerTxId={}", partnerTxId);

        return PartnerPaymentResponse.builder()
                .success(true)
                .partnerTransactionId(partnerTxId)
                .message("Thanh toán thành công qua ví MoMo")
                .build();
    }

    public PartnerPaymentResponse processPaymentFallback(PaymentProcessRequestedEvent event, Throwable t) {
        log.error("[MoMo Fallback] Giao dịch txId={} thất bại do MoMo gián đoạn hoặc ngắt mạch: {}",
                event.getTransactionId(), t.getMessage());

        return PartnerPaymentResponse.builder()
                .success(false)
                .message("Cổng MoMo tạm thời bảo trì hoặc lỗi kết nối. Vui lòng thử lại sau!")
                .build();
    }
}

