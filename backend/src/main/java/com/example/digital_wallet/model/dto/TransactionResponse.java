package com.example.digital_wallet.model.dto;

import com.example.digital_wallet.model.enums.PaymentMethod;
import com.example.digital_wallet.model.enums.TransactionStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TransactionResponse {

    private UUID transactionId;
    private String idempotencyKey;
    private UUID sourceAccountId;
    private UUID targetAccountId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private TransactionStatus status;
    private String message;
    private Instant createdAt;
}
