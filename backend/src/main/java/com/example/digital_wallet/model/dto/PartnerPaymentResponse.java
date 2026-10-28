package com.example.digital_wallet.model.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartnerPaymentResponse {

    private boolean success;
    private String partnerTransactionId;
    private String message;
}
