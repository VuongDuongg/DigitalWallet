package com.example.digital_wallet.client;

import com.example.digital_wallet.model.dto.PartnerPaymentResponse;
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
public class ExternalPaymentGatewayClient {

    private static final String SERVICE_NAME = "paymentGateway";

    /**
     * Gọi Cổng thanh toán đối tác bên ngoài (VNPAY / MoMo / Bank API).
     * Bọc quanh bởi Resilience4j Circuit Breaker và Retry.
     */
    @CircuitBreaker(name = SERVICE_NAME, fallbackMethod = "processPaymentFallback")
    @Retry(name = SERVICE_NAME)
    public PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws SocketTimeoutException {
        log.info("Đang gọi Cổng thanh toán đối tác cho giao dịch: txId={}, amount={}",
                event.getTransactionId(), event.getAmount());

        // KỊCH BẢN GIẢ LẬP ĐỂ TEST KIỂM THỬ:
        // 1. Nếu số tiền là 999,999 VND: Giả lập lỗi mạng timeout (để kích hoạt Retry và Circuit Breaker)
        if (event.getAmount().compareTo(new BigDecimal("999999.00")) == 0) {
            log.warn("Giả lập lỗi mạng SocketTimeoutException từ đối tác!");
            throw new SocketTimeoutException("Đối tác không phản hồi (Read timed out)");
        }

        // 2. Nếu số tiền là 888,888 VND: Giả lập đối tác từ chối giao dịch (thẻ bị khóa, sai OTP, hết hạn mức)
        if (event.getAmount().compareTo(new BigDecimal("888888.00")) == 0) {
            log.warn("Đối tác từ chối giao dịch txId={}: Thẻ bị khóa hoặc không đủ hạn mức đối tác", event.getTransactionId());
            return PartnerPaymentResponse.builder()
                    .success(false)
                    .message("Đối tác từ chối: Tài khoản thẻ nguồn không hợp lệ hoặc đã bị khóa")
                    .build();
        }

        // 3. Mặc định: Thanh toán thành công qua đối tác
        String partnerTxId = "VNPAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        log.info("Đối tác duyệt thanh toán thành công: txId={}, partnerTxId={}", event.getTransactionId(), partnerTxId);

        return PartnerPaymentResponse.builder()
                .success(true)
                .partnerTransactionId(partnerTxId)
                .message("Thanh toán thành công qua đối tác")
                .build();
    }

    /**
     * Fallback Method: Được gọi khi:
     * - Circuit Breaker đang ở trạng thái OPEN (ngắt mạch vì tỷ lệ lỗi đối tác vượt quá 50%).
     * - Hoặc đã thử Retry tối đa 3 lần mà vẫn thất bại do lỗi mạng.
     */
    public PartnerPaymentResponse processPaymentFallback(PaymentProcessRequestedEvent event, Throwable t) {
        log.error("Kích hoạt Fallback do lỗi cổng đối tác: txId={}, error={}",
                event.getTransactionId(), t.getMessage());

        return PartnerPaymentResponse.builder()
                .success(false)
                .partnerTransactionId(null)
                .message("Cổng thanh toán đối tác tạm thời không khả dụng: " + t.getMessage())
                .build();
    }
}
