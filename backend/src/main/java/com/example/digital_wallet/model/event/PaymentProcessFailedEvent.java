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
public class PaymentProcessFailedEvent {

    private UUID transactionId;
    private String idempotencyKey;
    private BigDecimal amount;
    private String reason;
    private Instant timestamp;
}
