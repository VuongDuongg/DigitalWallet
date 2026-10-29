package com.example.digital_wallet.client.impl;

import com.example.digital_wallet.client.PaymentGatewayStrategy;
import com.example.digital_wallet.model.dto.PartnerPaymentResponse;
import com.example.digital_wallet.model.enums.PaymentMethod;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.retry.annotation.Retry;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.net.SocketTimeoutException;
import java.util.UUID;

@Slf4j
@Component
public class ZaloPayGatewayStrategy implements PaymentGatewayStrategy {

    private static final String SERVICE_NAME = "paymentGateway";

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.ZALOPAY;
    }

    @Override
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "processPaymentFallback")
    @Retry(name = SERVICE_NAME)
    public PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws SocketTimeoutException {
        log.info("[ZaloPay Strategy] Đang gọi Cổng ZaloPay cho giao dịch txId={}, amount={}",
                event.getTransactionId(), event.getAmount());

        String partnerTxId = "ZALOPAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[ZaloPay Strategy] Thanh toán ZaloPay thành công: partnerTxId={}", partnerTxId);

        return PartnerPaymentResponse.builder()
                .success(true)
                .partnerTransactionId(partnerTxId)
                .message("Thanh toán thành công qua ZaloPay")
                .build();
    }

    public PartnerPaymentResponse processPaymentFallback(PaymentProcessRequestedEvent event, Throwable t) {
        log.error("[ZaloPay Fallback] Giao dịch txId={} thất bại do ZaloPay gián đoạn: {}",
                event.getTransactionId(), t.getMessage());

        return PartnerPaymentResponse.builder()
                .success(false)
                .message("Cổng ZaloPay đang bảo trì kết nối. Vui lòng thử lại sau!")
                .build();
    }
}

