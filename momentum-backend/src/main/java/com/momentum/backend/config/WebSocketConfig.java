package com.momentum.backend.config;

import com.momentum.backend.websocket.JwtHandshakeInterceptor;
import com.momentum.backend.websocket.TopicSubscriptionInterceptor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtHandshakeInterceptor jwtHandshakeInterceptor;
    private final TopicSubscriptionInterceptor topicSubscriptionInterceptor;
    private final com.momentum.backend.config.SecurityProperties securityProperties;

    public WebSocketConfig(
            JwtHandshakeInterceptor jwtHandshakeInterceptor,
            TopicSubscriptionInterceptor topicSubscriptionInterceptor,
            com.momentum.backend.config.SecurityProperties securityProperties
    ) {
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
        this.topicSubscriptionInterceptor = topicSubscriptionInterceptor;
        this.securityProperties = securityProperties;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        String[] origins = securityProperties.getAllowedOrigins().toArray(new String[0]);
        
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins)
                .addInterceptors(jwtHandshakeInterceptor);
                
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns(origins)
                .addInterceptors(jwtHandshakeInterceptor)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(topicSubscriptionInterceptor);
    }
}
