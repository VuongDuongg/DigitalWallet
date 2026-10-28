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
public class PaymentProcessCompletedEvent {

    private UUID transactionId;
    private String idempotencyKey;
    private BigDecimal amount;
    private String partnerTransactionId;
    private Instant timestamp;
}
