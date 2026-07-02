package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.StudySessionStartRequest;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.enums.Role;
import com.momentum.backend.enums.SessionStatus;
import com.momentum.backend.repository.StudySessionRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.repository.UserStatsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:sessiondb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
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
public class SessionControllerH2Test {

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private StudySessionRepository studySessionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    private User testUser;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE study_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE pomodoro_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE challenge_participants");
        jdbcTemplate.execute("TRUNCATE TABLE challenges");
        jdbcTemplate.execute("TRUNCATE TABLE goals");
        jdbcTemplate.execute("TRUNCATE TABLE group_members");
        jdbcTemplate.execute("TRUNCATE TABLE groups");
        jdbcTemplate.execute("TRUNCATE TABLE refresh_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE audit_logs");
        jdbcTemplate.execute("TRUNCATE TABLE user_verification_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE password_reset_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE user_profiles");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        testUser = User.builder()
                .username("testuser")
                .email("test@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(testUser);

        UserStats stats = UserStats.builder().user(testUser).studyHours(0.0).build();
        userStatsRepository.save(stats);
    }

    @Test
    @WithMockUser(username = "testuser")
    void test1_StartSessionSucceeds() throws Exception {
        StudySessionStartRequest request = StudySessionStartRequest.builder()
                .subject("Data Structures")
                .goal("Finish binary trees chapter")
                .build();

        mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.subject").value("Data Structures"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.startTime").exists())
                .andExpect(jsonPath("$.data.currentTime").exists());
    }

    @Test
    @WithMockUser(username = "testuser")
    void test2_StartSecondSessionWhileActiveReturns409() throws Exception {
        StudySessionStartRequest request = StudySessionStartRequest.builder()
                .subject("Algorithms")
                .build();

        // Start first session
        mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Attempt to start second — should fail with 409
        mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("User already has an active study session"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void test3_EndSessionComputesDurationAndUpdatesStats() throws Exception {
        StudySessionStartRequest request = StudySessionStartRequest.builder()
                .subject("System Design")
                .build();

        // Start session
        String startResponse = mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String sessionId = objectMapper.readTree(startResponse).get("data").get("id").asText();

        // End session
        mockMvc.perform(post("/api/v1/sessions/" + sessionId + "/end"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.durationMinutes").exists())
                .andExpect(jsonPath("$.data.durationMinutes", greaterThanOrEqualTo(1)));

        // Verify UserStats.studyHours was updated
        userStatsRepository.findAll().forEach(s -> {
            if (s.getUser().getId().equals(testUser.getId())) {
                assertThat(s.getStudyHours()).isGreaterThanOrEqualTo(0.0);
            }
        });
    }

    @Test
    @WithMockUser(username = "testuser")
    void test4_HistoryWithDateRangeFilterReturnsMatchingSessions() throws Exception {
        StudySessionStartRequest request = StudySessionStartRequest.builder()
                .subject("Java Concurrency")
                .build();

        // Start and end a session
        String startResp = mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        String sessionId = objectMapper.readTree(startResp).get("data").get("id").asText();
        mockMvc.perform(post("/api/v1/sessions/" + sessionId + "/end"))
                .andExpect(status().isOk());

        // Query history within a wide date range — should include our session
        String startDate = OffsetDateTime.now().minusDays(1).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);
        String endDate = OffsetDateTime.now().plusDays(1).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME);

        mockMvc.perform(get("/api/v1/sessions/history")
                        .param("startDate", startDate)
                        .param("endDate", endDate))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))))
                .andExpect(jsonPath("$.data.content[0].subject").value("Java Concurrency"));

        // Query history with subject filter that matches
        mockMvc.perform(get("/api/v1/sessions/history")
                        .param("subject", "Java"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(1))));

        // Query history with subject filter that does NOT match
        mockMvc.perform(get("/api/v1/sessions/history")
                        .param("subject", "nonexistentsubject99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(0)));
    }

    @Test
    @WithMockUser(username = "testuser")
    void test5_GetActiveSessionReturns204WhenNone() throws Exception {
        mockMvc.perform(get("/api/v1/sessions/active"))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "testuser")
    void test6_GetActiveSessionReturnsSessionWhenActive() throws Exception {
        StudySessionStartRequest request = StudySessionStartRequest.builder()
                .subject("Operating Systems")
                .build();

        mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Should return 200 with the active session — includes startTime for frontend timer
        mockMvc.perform(get("/api/v1/sessions/active"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"))
                .andExpect(jsonPath("$.data.startTime").exists())
                .andExpect(jsonPath("$.data.currentTime").exists()); // frontend: elapsed = currentTime - startTime
    }
}
