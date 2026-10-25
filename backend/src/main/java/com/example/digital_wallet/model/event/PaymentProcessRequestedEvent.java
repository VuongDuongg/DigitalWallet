package com.example.digital_wallet.model.event;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentProcessRequestedEvent {

    private UUID transactionId;
    private String idempotencyKey;
    private UUID sourceAccountId;
    private UUID targetAccountId;
    private BigDecimal amount;
    private Instant timestamp;
}
