package com.momentum.backend.security;

import com.momentum.backend.dto.request.ForgotPasswordRequest;
import com.momentum.backend.dto.request.LoginRequest;
import com.momentum.backend.dto.request.RegisterRequest;
import com.momentum.backend.dto.request.ResetPasswordRequest;
import com.momentum.backend.dto.response.AuthResponse;
import com.momentum.backend.dto.response.UserSummary;
import com.momentum.backend.entity.AuditLog;
import com.momentum.backend.entity.RefreshToken;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.Role;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.repository.AuditLogRepository;
import com.momentum.backend.repository.RefreshTokenRepository;
import com.momentum.backend.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            AuditLogRepository auditLogRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email is already registered");
        }

        String verificationToken = UUID.randomUUID().toString();
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .emailVerified(false)
                .verificationToken(verificationToken)
                .verificationTokenExpiry(OffsetDateTime.now().plusHours(24))
                .build();

        userRepository.save(user);

        // Print verification link to console (local profile behavior)
        System.out.println("--- EMAIL VERIFICATION LINK FOR USER " + request.getUsername() + " ---");
        System.out.println("http://localhost:8080/api/v1/auth/verify-email?token=" + verificationToken);
        System.out.println("-----------------------------------------------------------------");
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByVerificationToken(token)
                .orElseThrow(() -> new ValidationException("Invalid or expired verification token"));

        if (user.getVerificationTokenExpiry().isBefore(OffsetDateTime.now())) {
            throw new ValidationException("Verification token has expired");
        }

        user.setEmailVerified(true);
        user.setVerificationToken(null);
        user.setVerificationTokenExpiry(null);
        userRepository.save(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String usernameOrEmail = request.getUsernameOrEmail();
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail));

        if (userOpt.isEmpty()) {
            auditLogRepository.save(AuditLog.builder()
                    .username(usernameOrEmail)
                    .eventType("LOGIN_FAILURE")
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build());
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userOpt.get();

        // Check for active lockout
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(OffsetDateTime.now())) {
            auditLogRepository.save(AuditLog.builder()
                    .username(user.getUsername())
                    .eventType("LOCKED_OUT_ATTEMPT")
                    .ipAddress(ipAddress)
                    .userAgent(userAgent)
                    .build());
            throw new BadCredentialsException("Account is locked due to multiple failed login attempts. Try again after " + user.getLockoutUntil());
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= 5) {
                user.setLockoutUntil(OffsetDateTime.now().plusMinutes(15));
                auditLogRepository.save(AuditLog.builder()
                        .username(user.getUsername())
                        .eventType("LOCKOUT")
                        .ipAddress(ipAddress)
                        .userAgent(userAgent)
                        .build());
            } else {
                auditLogRepository.save(AuditLog.builder()
                        .username(user.getUsername())
                        .eventType("LOGIN_FAILURE")
                        .ipAddress(ipAddress)
                        .userAgent(userAgent)
                        .build());
            }

            userRepository.save(user);
            throw new BadCredentialsException("Invalid username or password");
        }

        // Reset lockout and failed attempts upon successful login
        user.setFailedLoginAttempts(0);
        user.setLockoutUntil(null);
        userRepository.save(user);

        // Generate tokens
        String accessToken = jwtService.generateAccessToken(user.getUsername());
        String refreshToken = jwtService.generateRefreshToken(user.getUsername());

        // Store hashed refresh token in database
        String tokenHash = passwordEncoder.encode(refreshToken);
        RefreshToken refreshTokenEntity = RefreshToken.builder()
                .user(user)
                .tokenHash(tokenHash)
                .expiryDate(OffsetDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshTokenEntity);

        // Record successful login audit
        auditLogRepository.save(AuditLog.builder()
                .username(user.getUsername())
                .eventType("LOGIN_SUCCESS")
                .ipAddress(ipAddress)
                .userAgent(userAgent)
                .build());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .user(UserSummary.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build())
                .build();
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

        // Match with stored tokens
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
            return; // Token invalid, ignore
        }

        Optional<User> userOpt = userRepository.findByUsername(username);
        if (userOpt.isPresent()) {
            UUID userId = userOpt.get().getId();
            var storedTokens = refreshTokenRepository.findByUserId(userId);
            for (RefreshToken stored : storedTokens) {
                if (passwordEncoder.matches(refreshTokenStr, stored.getTokenHash())) {
                    refreshTokenRepository.delete(stored);
                    break;
                }
            }
        }
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());
        if (userOpt.isEmpty()) {
            return; // Silent success to prevent enumeration
        }

        User user = userOpt.get();
        String resetToken = UUID.randomUUID().toString();
        user.setPasswordResetToken(resetToken);
        user.setPasswordResetTokenExpiry(OffsetDateTime.now().plusMinutes(15));
        userRepository.save(user);

        // Print reset link to console (local profile behavior)
        System.out.println("--- PASSWORD RESET LINK FOR USER " + user.getUsername() + " ---");
        System.out.println("http://localhost:8080/api/v1/auth/reset-password?token=" + resetToken);
        System.out.println("---------------------------------------------------------------");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByPasswordResetToken(request.getToken())
                .orElseThrow(() -> new ValidationException("Invalid or expired reset token"));

        if (user.getPasswordResetTokenExpiry().isBefore(OffsetDateTime.now())) {
            throw new ValidationException("Reset token has expired");
        }

        // Update password and invalidate all refresh tokens
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setPasswordResetToken(null);
        user.setPasswordResetTokenExpiry(null);
        userRepository.save(user);

        refreshTokenRepository.deleteByUserId(user.getId());
    }
}
