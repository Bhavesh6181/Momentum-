package com.momentum.backend.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "app.streak")
@Data
public class StreakProperties {
    private int minimumStudyMinutes = 15;
}
