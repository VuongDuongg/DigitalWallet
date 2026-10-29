package com.example.digital_wallet.service;

import com.example.digital_wallet.exception.DuplicateRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;
    private static final String IDEMP_PREFIX = "idemp:";
    private static final long DEFAULT_TTL_SECONDS = 120; // 2 phút cho PENDING
    private static final long COMPLETED_TTL_SECONDS = 86400; // 24 giờ cho trạng thái cuối

    /**
     * Thử chiếm quyền xử lý Idempotency Key kèm kiểm tra chữ ký băm (SHA-256) của Request Payload.
     * Ngăn chặn việc gửi cùng 1 Idempotency Key nhưng giả mạo/thay đổi số tiền hoặc tài khoản nhận.
     *
     * @param idempotencyKey Khóa duy nhất từ client (header X-Idempotency-Key)
     * @param payloadToHash Nội dung đại diện của request (sourceId + targetId + amount)
     */
    public void acquire(String idempotencyKey, String payloadToHash) {
        String redisKey = IDEMP_PREFIX + idempotencyKey;
        String requestHash = hashSha256(payloadToHash);

        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(redisKey, "PROCESSING:" + requestHash, Duration.ofSeconds(DEFAULT_TTL_SECONDS));

        if (Boolean.FALSE.equals(acquired)) {
            String existingVal = redisTemplate.opsForValue().get(redisKey);

            // Kiểm tra hash lưu trữ: Nếu hash gửi lên khác hash ban đầu -> Xung đột gian lận
            if (existingVal != null && existingVal.contains(":")) {
                String existingHash = existingVal.substring(existingVal.indexOf(":") + 1);
                if (!existingHash.isEmpty() && !existingHash.equals(requestHash)) {
                    log.error("Xung đột Idempotency: Key {} bị gửi lại với nội dung payload khác!", idempotencyKey);
                    throw new DuplicateRequestException("Xung đột Idempotency: Khóa này đã được sử dụng cho một giao dịch có thông tin khác!");
                }
            }

            log.warn("Phát hiện request trùng lặp với Idempotency Key: {}", idempotencyKey);
            throw new DuplicateRequestException("Giao dịch đang được xử lý hoặc đã hoàn tất. Vui lòng không gửi lại!");
        }
    }

    public void acquire(String idempotencyKey) {
        acquire(idempotencyKey, idempotencyKey);
    }

    /**
     * Đánh dấu giao dịch đã hoàn tất và lưu kèm Hash trong Redis (TTL 24 giờ để chống retry muộn).
     */
    public void complete(String idempotencyKey, String result) {
        String redisKey = IDEMP_PREFIX + idempotencyKey;
        String existingVal = redisTemplate.opsForValue().get(redisKey);
        String existingHash = "";
        if (existingVal != null && existingVal.contains(":")) {
            existingHash = existingVal.substring(existingVal.indexOf(":") + 1);
        }

        String finalVal = (result != null ? result : "COMPLETED") + ":" + existingHash;
        redisTemplate.opsForValue().set(redisKey, finalVal, Duration.ofSeconds(COMPLETED_TTL_SECONDS));
    }

    /**
     * Giải phóng key trong trường hợp xảy ra lỗi sớm trước khi ghi nhận vào DB.
     */
    public void release(String idempotencyKey) {
        String redisKey = IDEMP_PREFIX + idempotencyKey;
        redisTemplate.delete(redisKey);
    }

    private String hashSha256(String input) {
        if (input == null) return "";
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            return String.valueOf(input.hashCode());
        }
    }
}
