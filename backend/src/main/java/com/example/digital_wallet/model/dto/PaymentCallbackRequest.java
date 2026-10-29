package com.example.digital_wallet.model.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentCallbackRequest {

    @NotNull(message = "transactionId không được để trống")
    private UUID transactionId;

    private String partnerTransactionId;

    @NotNull(message = "amount không được để trống")
    private BigDecimal amount;

    @NotNull(message = "status không được để trống")
    private String status; // "SUCCESS" hoặc "FAILED"

    private String message;

    @NotNull(message = "signature không được để trống")
    private String signature;

    /**
     * Tạo chuỗi dữ liệu chuẩn tắc (canonical representation) để băm HMAC-SHA256.
     * Quy tắc: Sắp xếp các trường nghiệp vụ cốt lõi theo thứ tự bảng chữ cái cố định.
     */
    public String toCanonicalString() {
        return "amount=" + amount +
                "&partnerTransactionId=" + (partnerTransactionId != null ? partnerTransactionId : "") +
                "&status=" + status +
                "&transactionId=" + transactionId;
    }
}

