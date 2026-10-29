package com.example.digital_wallet.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class HmacUtilsTest {

    private final String secretKey = "super-secret-gateway-key";

    @Test
    @DisplayName("HMAC-SHA256: Tính toán và xác thực chữ ký thành công khi dữ liệu trùng khớp")
    void testValidSignature() {
        String data = "amount=50000.00&partnerTransactionId=MOMO12345&status=SUCCESS&transactionId=c9f8a32b-98f2-45e6-a05b-871d34f9a0c1";
        String signature = HmacUtils.calculateHmacSha256(data, secretKey);

        assertNotNull(signature);
        assertFalse(signature.isEmpty());
        assertTrue(HmacUtils.verifyHmacSha256(data, secretKey, signature));
    }

    @Test
    @DisplayName("HMAC-SHA256: Chống Webhook Spoofing - Từ chối khi kẻ tấn công sửa số tiền")
    void testTamperedDataRejected() {
        String originalData = "amount=50000.00&partnerTransactionId=MOMO12345&status=SUCCESS&transactionId=c9f8a32b-98f2-45e6-a05b-871d34f9a0c1";
        String signature = HmacUtils.calculateHmacSha256(originalData, secretKey);

        // Kẻ xấu giả mạo đổi amount từ 50,000 thành 5,000,000 nhưng dùng lại signature cũ
        String tamperedData = "amount=5000000.00&partnerTransactionId=MOMO12345&status=SUCCESS&transactionId=c9f8a32b-98f2-45e6-a05b-871d34f9a0c1";

        assertFalse(HmacUtils.verifyHmacSha256(tamperedData, secretKey, signature));
    }

    @Test
    @DisplayName("HMAC-SHA256: Từ chối khi chữ ký rỗng hoặc sai secret key")
    void testInvalidSecretKey() {
        String data = "amount=50000.00&partnerTransactionId=MOMO12345&status=SUCCESS&transactionId=c9f8a32b-98f2-45e6-a05b-871d34f9a0c1";
        String signature = HmacUtils.calculateHmacSha256(data, "wrong-key");

        assertFalse(HmacUtils.verifyHmacSha256(data, secretKey, signature));
        assertFalse(HmacUtils.verifyHmacSha256(data, secretKey, ""));
        assertFalse(HmacUtils.verifyHmacSha256(data, secretKey, null));
    }
}

