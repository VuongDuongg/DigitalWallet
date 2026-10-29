package com.example.digital_wallet.client;

import com.example.digital_wallet.model.dto.PartnerPaymentResponse;
import com.example.digital_wallet.model.enums.PaymentMethod;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;

public interface PaymentGatewayStrategy {

    PaymentMethod getPaymentMethod();

    PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws Exception;
}

