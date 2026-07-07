package com.momentum.backend.service;

import com.momentum.backend.dto.request.ForgotPasswordRequest;
import com.momentum.backend.dto.request.ResetPasswordRequest;
import com.momentum.backend.entity.PasswordResetToken;
import com.momentum.backend.entity.User;
import com.momentum.backend.event.PasswordResetCompletedEvent;
import com.momentum.backend.event.PasswordResetRequestedEvent;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.repository.PasswordResetTokenRepository;
import com.momentum.backend.repository.RefreshTokenRepository;
import com.momentum.backend.repository.UserRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class PasswordResetService {

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository resetTokenRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public PasswordResetService(
            UserRepository userRepository,
            PasswordResetTokenRepository resetTokenRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.resetTokenRepository = resetTokenRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return; // Silent success to prevent enumeration
        }

        User user = userOpt.get();
        
        // Clean up any existing reset tokens for this user first
        resetTokenRepository.deleteByUserId(user.getId());

        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryDate(OffsetDateTime.now().plusMinutes(15))
                .build();
        resetTokenRepository.save(resetToken);

        eventPublisher.publishEvent(new PasswordResetRequestedEvent(user, token));
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = resetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new ValidationException("Invalid or expired reset token"));

        if (resetToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new ValidationException("Reset token has expired");
        }

        User user = resetToken.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        // Delete the consumed reset token
        resetTokenRepository.delete(resetToken);

        // Invalidate all active session refresh tokens for the user
        refreshTokenRepository.deleteByUserId(user.getId());

        // Publish event for auditing
        eventPublisher.publishEvent(new PasswordResetCompletedEvent(user));
    }
}
