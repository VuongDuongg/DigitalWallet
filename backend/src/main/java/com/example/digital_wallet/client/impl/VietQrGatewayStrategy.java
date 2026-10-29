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
public class VietQrGatewayStrategy implements PaymentGatewayStrategy {

    private static final String SERVICE_NAME = "paymentGateway";

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.VIETQR;
    }

    @Override
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "processPaymentFallback")
    @Retry(name = SERVICE_NAME)
    public PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws SocketTimeoutException {
        log.info("[VietQR Strategy] Đang sinh mã và xác thực VietQR NAPAS 247 cho txId={}, amount={}",
                event.getTransactionId(), event.getAmount());

        String partnerTxId = "VIETQR-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[VietQR Strategy] Chuyển khoản nhanh VietQR thành công: partnerTxId={}", partnerTxId);

        return PartnerPaymentResponse.builder()
                .success(true)
                .partnerTransactionId(partnerTxId)
                .message("Thanh toán thành công qua VietQR NAPAS 247")
                .build();
    }

    public PartnerPaymentResponse processPaymentFallback(PaymentProcessRequestedEvent event, Throwable t) {
        log.error("[VietQR Fallback] Lỗi kết nối liên ngân hàng NAPAS 247: {}", t.getMessage());

        return PartnerPaymentResponse.builder()
                .success(false)
                .message("Hệ thống chuyển mạch VietQR NAPAS đang bảo trì. Vui lòng thử lại sau!")
                .build();
    }
}

