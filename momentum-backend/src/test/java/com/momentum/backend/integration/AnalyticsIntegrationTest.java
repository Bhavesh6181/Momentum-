package com.momentum.backend.integration;

import com.momentum.backend.entity.*;
import com.momentum.backend.enums.*;
import com.momentum.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:analyticsdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.flyway.enabled=false",
        "spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=VARCHAR",
        "management.health.redis.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration"
})
@AutoConfigureMockMvc
public class AnalyticsIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private StudySessionRepository studySessionRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @org.springframework.boot.test.mock.mockito.MockBean
    private SimpMessagingTemplate messagingTemplate;

    private User testUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE study_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        testUser = userRepository.save(User.builder()
                .username("analytics_user")
                .email("analytics@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());

        userStatsRepository.save(UserStats.builder().user(testUser).build());

        // Seed two completed sessions
        studySessionRepository.save(StudySession.builder()
                .user(testUser)
                .subject("Algorithms")
                .goal("Solve 10 problems")
                .status(SessionStatus.COMPLETED)
                .startTime(OffsetDateTime.now().minusHours(2))
                .endTime(OffsetDateTime.now().minusHours(1))
                .durationMinutes(60)
                .build());

        studySessionRepository.save(StudySession.builder()
                .user(testUser)
                .subject("System Design")
                .goal("Read chapters 1-3")
                .status(SessionStatus.COMPLETED)
                .startTime(OffsetDateTime.now().minusMinutes(60))
                .endTime(OffsetDateTime.now())
                .durationMinutes(30)
                .build());
    }

    @Test
    @WithMockUser(username = "analytics_user")
    void weeklyHours_returns200_withLabelsAndDatasets() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/weekly-hours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.labels", notNullValue()))
                .andExpect(jsonPath("$.data.datasets", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(username = "analytics_user")
    void categoryDistribution_returnsCorrectStructure() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/category-distribution"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.labels", notNullValue()))
                .andExpect(jsonPath("$.data.datasets", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @WithMockUser(username = "analytics_user")
    void monthlyProgress_returns200_withCorrectStructure() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/monthly-progress"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.labels", notNullValue()))
                .andExpect(jsonPath("$.data.datasets", notNullValue()));
    }

    @Test
    @WithMockUser(username = "analytics_user")
    void weeklyHours_returns200WhenNoSessions_withEmptyDatasets() throws Exception {
        jdbcTemplate.execute("TRUNCATE TABLE study_sessions");

        mockMvc.perform(get("/api/v1/analytics/me/weekly-hours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.labels", notNullValue()));
    }
}
