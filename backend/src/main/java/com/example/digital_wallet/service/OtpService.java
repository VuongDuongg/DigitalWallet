package com.example.digital_wallet.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class OtpService {

    private final StringRedisTemplate redisTemplate;
    private static final String OTP_PREFIX = "otp:phone:";
    private static final long OTP_TTL_SECONDS = 120; // 120 giây (2 phút)

    private final SecureRandom secureRandom = new SecureRandom();

    /**
     * Sinh mã OTP 6 chữ số ngẫu nhiên, lưu vào Redis với TTL 120s
     * và in trực tiếp ra Console / Terminal (Mock SMS Service) để kiểm thử.
     */
    public String generateAndSendOtp(String phoneNumber) {
        String cleanPhone = normalizePhoneNumber(phoneNumber);

        // Sinh 6 chữ số ngẫu nhiên (từ 000000 đến 999999)
        int randomPin = secureRandom.nextInt(1_000_000);
        String otp = String.format("%06d", randomPin);

        // Lưu vào Redis với thời hạn hết hạn chính xác 120 giây
        String redisKey = OTP_PREFIX + cleanPhone;
        redisTemplate.opsForValue().set(redisKey, otp, Duration.ofSeconds(OTP_TTL_SECONDS));

        // Mock SMS Service: In to, rõ ràng ra Terminal
        System.out.println("\n=======================================================");
        System.out.println(">>>> [TEST SMS] Ma OTP gui toi so " + cleanPhone + " la: " + otp + " <<<<");
        System.out.println("=======================================================\n");
        log.info(">>>> [TEST SMS] Ma OTP gui toi so {} la: {} <<<<", cleanPhone, otp);

        return otp;
    }

    /**
     * Xác thực mã OTP từ Redis.
     * Nếu chính xác, xóa key ngay lập tức (Single-use OTP - chống Replay Attack).
     */
    public boolean verifyOtp(String phoneNumber, String inputOtp) {
        String cleanPhone = normalizePhoneNumber(phoneNumber);
        String redisKey = OTP_PREFIX + cleanPhone;

        String storedOtp = redisTemplate.opsForValue().get(redisKey);

        if (storedOtp == null) {
            log.warn("Mã OTP cho số {} đã hết hạn (sau 120s) hoặc chưa từng được gửi!", cleanPhone);
            return false;
        }

        if (storedOtp.equals(inputOtp.trim())) {
            // Xóa ngay mã OTP đã sử dụng thành công
            redisTemplate.delete(redisKey);
            log.info("Xác thực OTP thành công cho số điện thoại: {}", cleanPhone);
            return true;
        } else {
            log.warn("Mã OTP nhập vào không khớp cho số {}: nhập [{}] vs mong đợi [{}]", cleanPhone, inputOtp, storedOtp);
            return false;
        }
    }

    /**
     * Chuẩn hóa số điện thoại về định dạng tiêu chuẩn (bắt đầu bằng 0)
     */
    private String normalizePhoneNumber(String phone) {
        if (phone == null) return "";
        String trimmed = phone.trim().replaceAll("\\s+", "");
        if (trimmed.startsWith("+84")) {
            return "0" + trimmed.substring(3);
        }
        return trimmed;
    }
}

