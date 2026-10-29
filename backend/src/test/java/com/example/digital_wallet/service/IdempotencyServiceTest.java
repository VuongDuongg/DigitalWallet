package com.example.digital_wallet.service;

import com.example.digital_wallet.exception.DuplicateRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.time.Duration;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdempotencyServiceTest {

    @Mock
    private StringRedisTemplate redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private IdempotencyService idempotencyService;

    @BeforeEach
    void setUp() {
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        idempotencyService = new IdempotencyService(redisTemplate);
    }

    @Test
    @DisplayName("Idempotency: Cho phép request đầu tiên ghi nhận vào Redis")
    void testFirstRequestSuccess() {
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class)))
                .thenReturn(Boolean.TRUE);

        idempotencyService.acquire("tx-key-001", "accA:accB:50000");

        verify(valueOperations, times(1))
                .setIfAbsent(eq("idemp:tx-key-001"), startsWith("PROCESSING:"), any(Duration.class));
    }

    @Test
    @DisplayName("Idempotency: Phát hiện gian lận khi cùng Key nhưng Payload bị tráo đổi (Mismatched Hash)")
    void testPayloadTamperingDetected() {
        // Lần đầu lưu key với hash của 50,000 VND
        when(valueOperations.setIfAbsent(anyString(), anyString(), any(Duration.class)))
                .thenReturn(Boolean.FALSE);
        // Giả sử trong Redis đang lưu hash của payload cũ
        when(valueOperations.get("idemp:tx-key-001"))
                .thenReturn("PROCESSING:aabbccddee112233");

        // Request thứ 2 gửi cùng key nhưng payload là 5,000,000 VND -> hash khác
        DuplicateRequestException ex = assertThrows(DuplicateRequestException.class, () ->
                idempotencyService.acquire("tx-key-001", "accA:accC:5000000")
        );

        assertTrue(ex.getMessage().contains("Xung đột Idempotency"));
    }
}

