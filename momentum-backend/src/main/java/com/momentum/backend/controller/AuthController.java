package com.momentum.backend.controller;

import com.momentum.backend.dto.request.ForgotPasswordRequest;
import com.momentum.backend.dto.request.LoginRequest;
import com.momentum.backend.dto.request.RegisterRequest;
import com.momentum.backend.dto.request.ResetPasswordRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.AuthResponse;
import com.momentum.backend.exception.RateLimitException;
import com.momentum.backend.security.AuthService;
import com.momentum.backend.security.RateLimiterService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;
    private final RateLimiterService rateLimiterService;

    public AuthController(AuthService authService, RateLimiterService rateLimiterService) {
        this.authService = authService;
        this.rateLimiterService = rateLimiterService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Registration successful. Please verify your email."));
    }

    @GetMapping("/verify-email")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam("token") String token) {
        authService.verifyEmail(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Email verified successfully."));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(
            @Valid @RequestBody LoginRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String clientIp = getClientIp(httpServletRequest);
        String userAgent = httpServletRequest.getHeader("User-Agent");

        // Rate limit: 10 requests per 1 minute
        String rateLimitKey = "login:" + clientIp;
        if (!rateLimiterService.isAllowed(rateLimitKey, 10, 60000)) {
            throw new RateLimitException("Too many login attempts. Please try again in a minute.");
        }

        AuthResponse authResponse = authService.login(request, clientIp, userAgent);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Login successful"));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(@RequestParam("token") String token) {
        AuthResponse authResponse = authService.refresh(token);
        return ResponseEntity.ok(ApiResponse.success(authResponse, "Token refreshed successfully"));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(@RequestParam("token") String token) {
        authService.logout(token);
        return ResponseEntity.ok(ApiResponse.success(null, "Logout successful"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String clientIp = getClientIp(httpServletRequest);

        // Rate limit: 5 requests per 1 minute
        String rateLimitKey = "forgot-password:" + clientIp;
        if (!rateLimiterService.isAllowed(rateLimitKey, 5, 60000)) {
            throw new RateLimitException("Too many forgot-password attempts. Please try again in a minute.");
        }

        authService.forgotPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "If the email exists, a reset link has been sent."));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok(ApiResponse.success(null, "Password reset successful."));
    }

    private String getClientIp(HttpServletRequest request) {
        String ipAddress = request.getHeader("X-Forwarded-For");
        if (ipAddress == null || ipAddress.isEmpty() || "unknown".equalsIgnoreCase(ipAddress)) {
            ipAddress = request.getRemoteAddr();
        }
        return ipAddress;
    }
}
