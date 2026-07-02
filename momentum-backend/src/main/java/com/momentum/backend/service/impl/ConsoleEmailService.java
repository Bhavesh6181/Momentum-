package com.momentum.backend.service.impl;

import com.momentum.backend.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class ConsoleEmailService implements EmailService {

    @Override
    public void sendVerificationEmail(String email, String username, String token) {
        log.info("--- Console Email Verification Link ---");
        log.info("To: {} ({})", email, username);
        log.info("Link: http://localhost:8080/api/v1/auth/verify-email?token={}", token);
        log.info("-----------------------------------------");
    }

    @Override
    public void sendPasswordResetEmail(String email, String username, String token) {
        log.info("--- Console Password Reset Link ---");
        log.info("To: {} ({})", email, username);
        log.info("Link: http://localhost:8080/api/v1/auth/reset-password?token={}", token);
        log.info("-------------------------------------");
    }
}
