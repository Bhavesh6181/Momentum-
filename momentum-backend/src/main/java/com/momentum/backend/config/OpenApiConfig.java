package com.momentum.backend.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI momentumOpenAPI() {
        final String securitySchemeName = "bearerAuth";

        return new OpenAPI()
                .info(new Info()
                        .title("Momentum API")
                        .description("""
                                Momentum is a collaborative study platform for placement preparation.
                                
                                **Modules:**
                                - Auth: Registration, login, JWT refresh, password reset
                                - Groups: Create/join study groups, manage membership, invite codes
                                - Sessions: Start/end study sessions, Pomodoro timer (server-side clock)
                                - Goals & Challenges: Personal/group goals, group challenges and leaderboards
                                - Real-time: WebSocket STOMP presence system and live activity feed
                                - Notifications: In-app push notifications via WebSocket + REST
                                - Analytics: Chart.js-ready study metrics endpoints
                                - Search: Cross-entity ILIKE search with group privacy enforcement
                                - GitHub: Public GitHub activity sync and caching
                                - Leaderboards: Redis sorted-set backed rankings
                                - Streaks: Daily study streak tracking with milestones
                                """)
                        .version("v1.0.0")
                        .contact(new Contact()
                                .name("Bhavesh")
                                .url("https://github.com/Bhavesh6181/Momentum-"))
                        .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")))
                .addSecurityItem(new SecurityRequirement().addList(securitySchemeName))
                .components(new Components()
                        .addSecuritySchemes(securitySchemeName, new SecurityScheme()
                                .name(securitySchemeName)
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")
                                .description("Paste the JWT access token obtained from POST /api/v1/auth/login")));
    }
}
