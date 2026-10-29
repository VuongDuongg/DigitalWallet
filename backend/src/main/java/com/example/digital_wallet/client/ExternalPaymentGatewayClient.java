package com.example.digital_wallet.client;

import com.example.digital_wallet.model.dto.PartnerPaymentResponse;
import com.example.digital_wallet.model.event.PaymentProcessRequestedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

/**
 * @deprecated Đã được refactor sang Strategy Pattern {@link PaymentGatewayStrategy} và {@link PaymentGatewayFactory}.
 */
@Deprecated
@Component
@RequiredArgsConstructor
public class ExternalPaymentGatewayClient {

    private final PaymentGatewayFactory gatewayFactory;

    public PartnerPaymentResponse processPayment(PaymentProcessRequestedEvent event) throws Exception {
        return gatewayFactory.getStrategy(event.getPaymentMethod()).processPayment(event);
    }
}
