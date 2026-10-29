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
public class VnPayGatewayStrategy implements PaymentGatewayStrategy {

    private static final String SERVICE_NAME = "paymentGateway";

    @Override
    public PaymentMethod getPaymentMethod() {
        return PaymentMethod.VNPAY;
    }

    @Override
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "processPaymentFallback")
    @Retry(name = SERVICE_NAME)
    public PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws SocketTimeoutException {
        log.info("[VNPAY Strategy] Đang gọi Cổng VNPAY cho giao dịch txId={}, amount={}",
                event.getTransactionId(), event.getAmount());

        // Kịch bản test:
        // 1. Số tiền 999,999 VND: Giả lập lỗi mạng timeout
        if (event.getAmount().compareTo(new BigDecimal("999999.00")) == 0) {
            log.warn("[VNPAY Strategy] Giả lập lỗi mạng SocketTimeoutException từ VNPAY!");
            throw new SocketTimeoutException("Cổng VNPAY không phản hồi (Read timed out)");
        }

        // 2. Số tiền 888,888 VND: Giả lập thẻ bị khóa / từ chối
        if (event.getAmount().compareTo(new BigDecimal("888888.00")) == 0) {
            log.warn("[VNPAY Strategy] VNPAY từ chối giao dịch txId={}: Thẻ nguồn không hợp lệ hoặc đã bị khóa",
                    event.getTransactionId());
            return PartnerPaymentResponse.builder()
                    .success(false)
                    .message("VNPAY từ chối: Tài khoản thẻ nguồn không hợp lệ hoặc đã bị khóa")
                    .build();
        }

        // 3. Mặc định: Thanh toán thành công
        String partnerTxId = "VNPAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("[VNPAY Strategy] Thanh toán VNPAY thành công: partnerTxId={}", partnerTxId);

        return PartnerPaymentResponse.builder()
                .success(true)
                .partnerTransactionId(partnerTxId)
                .message("Thanh toán thành công qua cổng VNPAY")
                .build();
    }

    public PartnerPaymentResponse processPaymentFallback(PaymentProcessRequestedEvent event, Throwable t) {
        log.error("[VNPAY Fallback] Giao dịch txId={} thất bại do lỗi mạng hoặc ngắt mạch (Circuit Breaker OPEN): {}",
                event.getTransactionId(), t.getMessage());

        return PartnerPaymentResponse.builder()
                .success(false)
                .message("Cổng VNPAY tạm thời gián đoạn hoặc không thể kết nối. Vui lòng thử lại sau!")
                .build();
    }
}

