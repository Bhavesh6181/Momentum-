package com.momentum.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DatabaseConfig {

    @Value("${spring.datasource.url}")
    private String databaseUrl;

    @Value("${spring.datasource.username:}")
    private String username;

    @Value("${spring.datasource.password:}")
    private String password;

    @Value("${spring.datasource.driver-class-name:org.postgresql.Driver}")
    private String driverClassName;

    @Bean
    public DataSource dataSource() {
        String url = databaseUrl;
        if (url != null) {
            if (url.startsWith("postgres://")) {
                url = "jdbc:postgresql://" + url.substring("postgres://".length());
            } else if (url.startsWith("postgresql://")) {
                url = "jdbc:postgresql://" + url.substring("postgresql://".length());
            }
        }
        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(password)
                .driverClassName(driverClassName)
                .build();
    }
}
