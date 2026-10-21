package com.example.digital_wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.redisson.api.RLock;
import org.redisson.api.RedissonClient;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class DistributedLockService {

    private final RedissonClient redissonClient;

    /**
     * Thực thi một tác vụ an toàn với Redisson Distributed Lock.
     * @param lockKey Key định danh tài nguyên cần khóa (ví dụ: "lock:account:<UUID>")
     * @param waitTimeSeconds Thời gian tối đa chờ để lấy được khóa (ví dụ: 3s)
     * @param leaseTimeSeconds Thời gian tối đa giữ khóa trước khi tự động nhả để chống Deadlock (ví dụ: 5s)
     * @param task Đoạn logic nghiệp vụ cần thực thi
     * @return Kết quả trả về của task
     */
    public <T> T executeWithLock(String lockKey, long waitTimeSeconds, long leaseTimeSeconds, Supplier<T> task) {
        RLock lock = redissonClient.getLock(lockKey);
        boolean isLocked = false;
        try {
            isLocked = lock.tryLock(waitTimeSeconds, leaseTimeSeconds, TimeUnit.SECONDS);
            if (!isLocked) {
                log.warn("Không thể lấy Distributed Lock cho key: {} trong {}s", lockKey, waitTimeSeconds);
                throw new RuntimeException("Hệ thống đang bận xử lý giao dịch cho tài khoản này. Vui lòng thử lại sau giây lát!");
            }
            return task.get();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Tiến trình bị gián đoạn khi đang chờ lấy khóa: " + lockKey, e);
        } finally {
            if (isLocked && lock.isHeldByCurrentThread()) {
                lock.unlock();
                log.debug("Đã giải phóng Distributed Lock cho key: {}", lockKey);
            }
        }
    }

    /**
     * Thực thi tác vụ không có giá trị trả về (Runnable).
     */
    public void executeWithLock(String lockKey, long waitTimeSeconds, long leaseTimeSeconds, Runnable task) {
        executeWithLock(lockKey, waitTimeSeconds, leaseTimeSeconds, () -> {
            task.run();
            return null;
        });
    }
}
