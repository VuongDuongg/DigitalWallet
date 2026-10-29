package com.example.digital_wallet.util;

import lombok.extern.slf4j.Slf4j;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.InvalidKeyException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

@Slf4j
public final class HmacUtils {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private HmacUtils() {
        // Utility class
    }

    /**
     * Tính toán mã băm HMAC-SHA256 cho chuỗi dữ liệu với Secret Key.
     *
     * @param data Dữ liệu chuẩn hóa cần ký (Canonical string)
     * @param key  Khóa bí mật chia sẻ giữa Cổng thanh toán và Ví
     * @return Chuỗi Hexadecimal biểu diễn chữ ký số
     */
    public static String calculateHmacSha256(String data, String key) {
        if (data == null || key == null) {
            throw new IllegalArgumentException("Data và Key không được rỗng khi tạo HMAC");
        }
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            SecretKeySpec secretKeySpec = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
            mac.init(secretKeySpec);
            byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(rawHmac);
        } catch (NoSuchAlgorithmException | InvalidKeyException e) {
            log.error("Lỗi khi tính toán HMAC-SHA256: {}", e.getMessage(), e);
            throw new RuntimeException("Lỗi thuật toán mã hóa chữ ký số", e);
        }
    }

    /**
     * Xác thực chữ ký số HMAC-SHA256 sử dụng so sánh an toàn Constant-Time
     * (MessageDigest.isEqual) nhằm triệt tiêu hoàn toàn lỗ hổng tấn công dò thời gian (Timing Attack).
     *
     * @param data              Chuỗi dữ liệu nhận được
     * @param key               Khóa bí mật
     * @param receivedSignature Chữ ký số gửi kèm trong Header hoặc Body của Webhook
     * @return true nếu chữ ký hợp lệ, false nếu bị giả mạo hoặc sai lệch
     */
    public static boolean verifyHmacSha256(String data, String key, String receivedSignature) {
        if (receivedSignature == null || receivedSignature.trim().isEmpty()) {
            return false;
        }
        try {
            String calculatedSignature = calculateHmacSha256(data, key);
            byte[] a = calculatedSignature.toLowerCase().getBytes(StandardCharsets.UTF_8);
            byte[] b = receivedSignature.toLowerCase().getBytes(StandardCharsets.UTF_8);
            return MessageDigest.isEqual(a, b);
        } catch (Exception e) {
            log.warn("Xác thực HMAC thất bại do ngoại lệ: {}", e.getMessage());
            return false;
        }
    }
}

