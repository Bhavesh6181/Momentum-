package com.momentum.backend.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ForgotPasswordRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}
