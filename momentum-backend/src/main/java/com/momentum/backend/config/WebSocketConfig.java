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

    public WebSocketConfig(
            JwtHandshakeInterceptor jwtHandshakeInterceptor,
            TopicSubscriptionInterceptor topicSubscriptionInterceptor
    ) {
        this.jwtHandshakeInterceptor = jwtHandshakeInterceptor;
        this.topicSubscriptionInterceptor = topicSubscriptionInterceptor;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic", "/queue");
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .addInterceptors(jwtHandshakeInterceptor);
                
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .addInterceptors(jwtHandshakeInterceptor)
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(topicSubscriptionInterceptor);
    }
}
