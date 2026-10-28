package com.example.digital_wallet.model.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DepositRequest {

    @NotNull(message = "Account ID không được để trống")
    private UUID accountId;

    @NotNull(message = "Số tiền nạp không được để trống")
    @DecimalMin(value = "1000.00", message = "Số tiền nạp tối thiểu là 1,000 VND")
    private BigDecimal amount;
}
