package com.example.digital_wallet.client;

import com.example.digital_wallet.model.enums.PaymentMethod;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Component
public class PaymentGatewayFactory {

    private final Map<PaymentMethod, PaymentGatewayStrategy> strategies;

    public PaymentGatewayFactory(List<PaymentGatewayStrategy> strategyList) {
        this.strategies = strategyList.stream()
                .collect(Collectors.toMap(PaymentGatewayStrategy::getPaymentMethod, Function.identity()));
        log.info("Khởi tạo PaymentGatewayFactory thành công với {} chiến lược thanh toán: {}",
                strategies.size(), strategies.keySet());
    }

    public PaymentGatewayStrategy getStrategy(PaymentMethod method) {
        PaymentMethod targetMethod = method != null ? method : PaymentMethod.VNPAY;
        PaymentGatewayStrategy strategy = strategies.get(targetMethod);
        if (strategy == null) {
            log.warn("Không tìm thấy Strategy cho phương thức {}, fallback về VNPAY", targetMethod);
            strategy = strategies.get(PaymentMethod.VNPAY);
        }
        if (strategy == null) {
            throw new IllegalArgumentException("Không tìm thấy cổng thanh toán phù hợp cho: " + targetMethod);
        }
        return strategy;
    }
}

