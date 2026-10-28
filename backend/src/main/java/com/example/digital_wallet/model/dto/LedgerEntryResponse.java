package com.example.digital_wallet.model.dto;

import com.example.digital_wallet.model.enums.EntryType;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntryResponse {

    private UUID entryId;
    private UUID transactionId;
    private UUID accountId;
    private EntryType entryType;
    private BigDecimal amount;
    private Instant createdAt;
}

