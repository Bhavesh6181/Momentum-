package com.momentum.backend.service;

import com.momentum.backend.config.SecurityProperties;
import com.momentum.backend.dto.request.LoginRequest;
import com.momentum.backend.dto.response.AuthResponse;
import com.momentum.backend.dto.response.UserSummary;
import com.momentum.backend.entity.RefreshToken;
import com.momentum.backend.entity.User;
import com.momentum.backend.event.UserLockedOutEvent;
import com.momentum.backend.event.UserLoggedInEvent;
import com.momentum.backend.event.UserLoginFailedEvent;
import com.momentum.backend.repository.RefreshTokenRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.security.JwtService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class LoginService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecurityProperties securityProperties;
    private final ApplicationEventPublisher eventPublisher;

    public LoginService(
            UserRepository userRepository,
            RefreshTokenRepository refreshTokenRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            SecurityProperties securityProperties,
            ApplicationEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.securityProperties = securityProperties;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public AuthResponse login(LoginRequest request, String ipAddress, String userAgent) {
        String usernameOrEmail = request.getUsernameOrEmail();
        Optional<User> userOpt = userRepository.findByUsername(usernameOrEmail)
                .or(() -> userRepository.findByEmail(usernameOrEmail));

        if (userOpt.isEmpty()) {
            eventPublisher.publishEvent(new UserLoginFailedEvent(usernameOrEmail, ipAddress, userAgent));
            throw new BadCredentialsException("Invalid username or password");
        }

        User user = userOpt.get();

        // Check for active lockout
        if (user.getLockoutUntil() != null && user.getLockoutUntil().isAfter(OffsetDateTime.now())) {
            eventPublisher.publishEvent(new UserLoginFailedEvent(user.getUsername(), ipAddress, userAgent));
            throw new BadCredentialsException("Account is locked due to multiple failed login attempts. Try again after " + user.getLockoutUntil());
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= securityProperties.getMaxFailedLoginAttempts()) {
                user.setLockoutUntil(OffsetDateTime.now().plusMinutes(securityProperties.getLockoutDurationMinutes()));
                eventPublisher.publishEvent(new UserLockedOutEvent(user.getUsername(), ipAddress, userAgent));
            } else {
                eventPublisher.publishEvent(new UserLoginFailedEvent(user.getUsername(), ipAddress, userAgent));
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

        // Record successful login audit via event
        eventPublisher.publishEvent(new UserLoggedInEvent(user.getUsername(), ipAddress, userAgent));

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
}
