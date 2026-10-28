package com.example.digital_wallet.model.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateAccountRequest {

    @NotBlank(message = "User ID không được để trống")
    private String userId;

    @Builder.Default
    private String currency = "VND";
}
