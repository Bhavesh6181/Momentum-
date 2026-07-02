package com.momentum.backend.service;

import com.momentum.backend.dto.response.AuthResponse;
import com.momentum.backend.dto.response.UserSummary;
import com.momentum.backend.entity.RefreshToken;
import com.momentum.backend.entity.User;
import com.momentum.backend.event.UserLoggedOutEvent;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.repository.RefreshTokenRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.security.JwtService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class TokenRotationService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ApplicationEventPublisher eventPublisher;

    public TokenRotationService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public AuthResponse refresh(String refreshTokenStr) {
        String username;
        try {
            username = jwtService.extractUsername(refreshTokenStr);
        } catch (Exception e) {
            throw new ValidationException("Invalid refresh token");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ValidationException("Invalid refresh token"));

        boolean tokenMatch = false;
        var storedTokens = refreshTokenRepository.findByUserId(user.getId());
        for (RefreshToken stored : storedTokens) {
            if (!stored.isRevoked() && stored.getExpiryDate().isAfter(OffsetDateTime.now())) {
                if (passwordEncoder.matches(refreshTokenStr, stored.getTokenHash())) {
                    stored.setRevoked(true); // Rotate refresh token (revoke old one)
                    refreshTokenRepository.save(stored);
                    tokenMatch = true;
                    break;
                }
            }
        }

        if (!tokenMatch) {
            throw new ValidationException("Invalid or expired refresh token");
        }

        // Issue new tokens
        String newAccessToken = jwtService.generateAccessToken(user.getUsername());
        String newRefreshToken = jwtService.generateRefreshToken(user.getUsername());

        // Save new rotated refresh token
        String newHash = passwordEncoder.encode(newRefreshToken);
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .tokenHash(newHash)
                .expiryDate(OffsetDateTime.now().plusDays(7))
                .build());

        return AuthResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .user(UserSummary.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .build();
    }

    @Transactional
    public void logout(String refreshTokenStr) {
        String username;
        try {
            username = jwtService.extractUsername(refreshTokenStr);
        } catch (Exception e) {
            return;
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            UUID userId = userOpt.get().getId();
            var storedTokens = refreshTokenRepository.findByUserId(userId);
            for (RefreshToken stored : storedTokens) {
                if (passwordEncoder.matches(refreshTokenStr, stored.getTokenHash())) {
                    refreshTokenRepository.delete(stored);
                    eventPublisher.publishEvent(new UserLoggedOutEvent(username));
                    break;
                }
            }
        }
    }
}
