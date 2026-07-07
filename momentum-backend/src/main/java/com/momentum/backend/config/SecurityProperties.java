package com.momentum.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.security")
@Data
public class SecurityProperties {
    
    private String jwtSecret = "dGhpcy1pcy1hLXNlY3VyZS1zZWNyZXQta2V5LXRvLWJlLXVzZWQtZm9yLWp3dC10b2tlbnMtZ2VuZXJhdGlvbi1tb21lbnR1bQ=="; // default fallback key
    private long accessTokenExpirationMs = 900000L; // 15 mins
    private long refreshTokenExpirationMs = 604800000L; // 7 days
    private int maxFailedLoginAttempts = 5;
    private int lockoutDurationMinutes = 15;
    
    private int loginRateLimit = 10;
    private long loginRatePeriodMs = 60000L; // 1 min
    
    private int forgotPasswordRateLimit = 5;
    private long forgotPasswordRatePeriodMs = 60000L; // 1 min

    private java.util.List<String> allowedOrigins = java.util.Arrays.asList(
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:5175",
            "http://localhost:4173"
    );
}

