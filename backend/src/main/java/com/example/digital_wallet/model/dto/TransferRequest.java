package com.example.digital_wallet.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransferRequest {

    @NotBlank(message = "Idempotency key không được để trống")
    private String idempotencyKey;

    @NotNull(message = "Tài khoản nguồn không được để trống")
    private UUID sourceAccountId;

    @NotNull(message = "Tài khoản đích không được để trống")
    private UUID targetAccountId;

    @NotNull(message = "Số tiền không được để trống")
    @DecimalMin(value = "1000.00", message = "Số tiền chuyển tối thiểu là 1,000 VND")
    private BigDecimal amount;

    private String description;
}
