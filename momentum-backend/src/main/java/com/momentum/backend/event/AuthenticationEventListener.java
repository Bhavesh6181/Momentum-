package com.momentum.backend.event;

import com.momentum.backend.entity.AuditLog;
import com.momentum.backend.repository.AuditLogRepository;
import com.momentum.backend.service.EmailService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationEventListener {

    private final EmailService emailService;
    private final AuditLogRepository auditLogRepository;

    public AuthenticationEventListener(EmailService emailService, AuditLogRepository auditLogRepository) {
        this.emailService = emailService;
        this.auditLogRepository = auditLogRepository;
    }

    @EventListener
    public void handleUserRegistered(UserRegisteredEvent event) {
        emailService.sendVerificationEmail(
                event.getUser().getEmail(),
                event.getUser().getUsername(),
                event.getVerificationToken()
        );
    }

    @EventListener
    public void handleUserLoggedIn(UserLoggedInEvent event) {
        auditLogRepository.save(AuditLog.builder()
                .username(event.getUsername())
                .eventType("LOGIN_SUCCESS")
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .build());
    }

    @EventListener
    public void handleUserLoggedOut(UserLoggedOutEvent event) {
        auditLogRepository.save(AuditLog.builder()
                .username(event.getUsername())
                .eventType("LOGOUT")
                .ipAddress("N/A")
                .userAgent("N/A")
                .build());
    }

    @EventListener
    public void handleUserLockedOut(UserLockedOutEvent event) {
        auditLogRepository.save(AuditLog.builder()
                .username(event.getUsername())
                .eventType("LOCKOUT")
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .build());
    }

    @EventListener
    public void handlePasswordResetRequested(PasswordResetRequestedEvent event) {
        emailService.sendPasswordResetEmail(
                event.getUser().getEmail(),
                event.getUser().getUsername(),
                event.getResetToken()
        );
    }

    @EventListener
    public void handlePasswordResetCompleted(PasswordResetCompletedEvent event) {
        auditLogRepository.save(AuditLog.builder()
                .username(event.getUser().getUsername())
                .eventType("PASSWORD_RESET")
                .ipAddress("N/A")
                .userAgent("N/A")
                .build());
    }

    @EventListener
    public void handleUserLoginFailed(UserLoginFailedEvent event) {
        auditLogRepository.save(AuditLog.builder()
                .username(event.getUsername())
                .eventType("LOGIN_FAILURE")
                .ipAddress(event.getIpAddress())
                .userAgent(event.getUserAgent())
                .build());
    }
}
