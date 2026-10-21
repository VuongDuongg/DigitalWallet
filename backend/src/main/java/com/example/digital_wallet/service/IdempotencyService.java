package com.example.digital_wallet.service;

import com.example.digital_wallet.exception.DuplicateRequestException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdempotencyService {

    private final StringRedisTemplate redisTemplate;
    private static final String IDEMP_PREFIX = "idemp:";
    private static final long DEFAULT_TTL_SECONDS = 120; // 2 phút

    /**
     * Thử chiếm quyền xử lý Idempotency Key bằng Redis SETNX (SET if Not eXists).
     * @param idempotencyKey Key từ client (header X-Idempotency-Key)
     * @throws DuplicateRequestException nếu request đang được xử lý hoặc đã hoàn tất
     */
    public void acquire(String idempotencyKey) {
        String redisKey = IDEMP_PREFIX + idempotencyKey;
        Boolean acquired = redisTemplate.opsForValue()
                .setIfAbsent(redisKey, "PROCESSING", Duration.ofSeconds(DEFAULT_TTL_SECONDS));

        if (Boolean.FALSE.equals(acquired)) {
            log.warn("Phát hiện request trùng lặp với Idempotency Key: {}", idempotencyKey);
            throw new DuplicateRequestException("Giao dịch đang được xử lý hoặc đã hoàn tất. Vui lòng không gửi lại!");
        }
    }

    /**
     * Đánh dấu giao dịch đã thành công và lưu kết quả rút gọn trong Redis để phản hồi nhanh nếu bị retry.
     */
    public void complete(String idempotencyKey, String result) {
        String redisKey = IDEMP_PREFIX + idempotencyKey;
        redisTemplate.opsForValue().set(redisKey, result != null ? result : "COMPLETED", Duration.ofSeconds(DEFAULT_TTL_SECONDS));
    }

    /**
     * Giải phóng key trong trường hợp xảy ra lỗi sớm trước khi ghi nhận vào DB, cho phép người dùng thử lại ngay.
     */
    public void release(String idempotencyKey) {
        String redisKey = IDEMP_PREFIX + idempotencyKey;
        redisTemplate.delete(redisKey);
    }
}
