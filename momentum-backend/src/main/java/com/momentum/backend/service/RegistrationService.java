package com.momentum.backend.service;

import com.momentum.backend.dto.request.RegisterRequest;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.entity.UserVerificationToken;
import com.momentum.backend.enums.Role;
import com.momentum.backend.event.UserRegisteredEvent;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.repository.UserVerificationTokenRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class RegistrationService {

    private final UserRepository userRepository;
    private final UserVerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ApplicationEventPublisher eventPublisher;

    public RegistrationService(
            UserRepository userRepository,
            UserVerificationTokenRepository verificationTokenRepository,
            PasswordEncoder passwordEncoder,
            ApplicationEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public void register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ValidationException("Username is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ValidationException("Email is already registered");
        }

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.STUDENT)
                .emailVerified(false)
                .build();

        user.setProfile(UserProfile.builder().user(user).build());
        user.setStats(UserStats.builder().user(user).build());

        User savedUser = userRepository.save(user);

        String token = UUID.randomUUID().toString();
        UserVerificationToken verificationToken = UserVerificationToken.builder()
                .user(savedUser)
                .token(token)
                .expiryDate(OffsetDateTime.now().plusHours(24))
                .build();
        verificationTokenRepository.save(verificationToken);

        eventPublisher.publishEvent(new UserRegisteredEvent(savedUser, token));
    }

    @Transactional
    public void verifyEmail(String token) {
        UserVerificationToken verificationToken = verificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new ValidationException("Invalid or expired verification token"));

        if (verificationToken.getExpiryDate().isBefore(OffsetDateTime.now())) {
            throw new ValidationException("Verification token has expired");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        userRepository.save(user);

        verificationTokenRepository.delete(verificationToken);
    }
}
