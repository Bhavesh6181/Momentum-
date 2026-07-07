package com.momentum.backend.service;

public interface EmailService {
    void sendVerificationEmail(String email, String username, String token);
    void sendPasswordResetEmail(String email, String username, String token);
}
