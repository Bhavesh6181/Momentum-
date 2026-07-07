package com.momentum.backend.websocket;

import com.momentum.backend.security.CustomUserDetailsService;
import com.momentum.backend.security.JwtService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.http.server.ServletServerHttpRequest;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.util.Map;

@Component
@Slf4j
public class JwtHandshakeInterceptor implements HandshakeInterceptor {

    private final JwtService jwtService;
    private final CustomUserDetailsService userDetailsService;

    public JwtHandshakeInterceptor(JwtService jwtService, CustomUserDetailsService userDetailsService) {
        this.jwtService = jwtService;
        this.userDetailsService = userDetailsService;
    }

    @Override
    public boolean beforeHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Map<String, Object> attributes
    ) throws Exception {
        if (request instanceof ServletServerHttpRequest) {
            ServletServerHttpRequest servletRequest = (ServletServerHttpRequest) request;
            String token = servletRequest.getServletRequest().getParameter("token");

            if (StringUtils.hasText(token)) {
                try {
                    String username = jwtService.extractUsername(token);
                    if (StringUtils.hasText(username)) {
                        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                        if (jwtService.isTokenValid(token, userDetails)) {
                            attributes.put("username", username);
                            log.info("WebSocket handshake successful for user: {}", username);
                            return true;
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to validate JWT token for WebSocket handshake", e);
                }
            }
        }
        
        response.setStatusCode(HttpStatus.UNAUTHORIZED);
        log.warn("WebSocket handshake rejected: Invalid or missing token");
        return false;
    }

    @Override
    public void afterHandshake(
            ServerHttpRequest request,
            ServerHttpResponse response,
            WebSocketHandler wsHandler,
            Exception exception
    ) {
        // No-op
    }
}
