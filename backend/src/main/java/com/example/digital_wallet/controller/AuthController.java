package com.example.digital_wallet.controller;

import com.example.digital_wallet.model.dto.OtpResponse;
import com.example.digital_wallet.model.dto.SendOtpRequest;
import com.example.digital_wallet.model.dto.VerifyOtpRequest;
import com.example.digital_wallet.service.OtpService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Authentication & OTP", description = "Dịch vụ xác thực danh tính và gửi nhận OTP (Mock SMS)")
public class AuthController {

    private final OtpService otpService;

    @PostMapping("/otp/send")
    @Operation(summary = "Gửi mã xác thực OTP 6 số (Lưu Redis 120s, Mock in ra Terminal)")
    public ResponseEntity<OtpResponse> sendOtp(@Valid @RequestBody SendOtpRequest request) {
        String cleanPhone = request.getPhoneNumber().trim();
        otpService.generateAndSendOtp(cleanPhone);

        return ResponseEntity.ok(OtpResponse.builder()
                .success(true)
                .message("Mã xác thực OTP đã được gửi! Vui lòng xem tại Console/Terminal Spring Boot.")
                .expiresInSeconds(120)
                .phoneNumber(cleanPhone)
                .build());
    }

    @PostMapping("/otp/verify")
    @Operation(summary = "Xác thực mã OTP nhập từ ứng dụng điện thoại")
    public ResponseEntity<OtpResponse> verifyOtp(@Valid @RequestBody VerifyOtpRequest request) {
        String cleanPhone = request.getPhoneNumber().trim();
        boolean isValid = otpService.verifyOtp(cleanPhone, request.getOtp());

        if (isValid) {
            return ResponseEntity.ok(OtpResponse.builder()
                    .success(true)
                    .message("Xác thực mã OTP thành công!")
                    .phoneNumber(cleanPhone)
                    .build());
        } else {
            return ResponseEntity.badRequest().body(OtpResponse.builder()
                    .success(false)
                    .message("Mã OTP không chính xác hoặc đã hết hạn (sau 120 giây)!")
                    .phoneNumber(cleanPhone)
                    .build());
        }
    }
}

