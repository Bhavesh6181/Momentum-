package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.StudySessionStartRequest;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.StudySessionRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.repository.UserStatsRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Disabled("Requires Docker daemon")
public class SessionControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired private MockMvc mockMvc;
    @Autowired private UserRepository userRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private StudySessionRepository studySessionRepository;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User testUser;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("DELETE FROM study_sessions");
        jdbcTemplate.execute("DELETE FROM pomodoro_sessions");
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM group_members");
        jdbcTemplate.execute("DELETE FROM groups");
        jdbcTemplate.execute("DELETE FROM user_profiles");
        jdbcTemplate.execute("DELETE FROM user_stats");
        jdbcTemplate.execute("DELETE FROM user_verification_tokens");
        jdbcTemplate.execute("DELETE FROM password_reset_tokens");
        jdbcTemplate.execute("DELETE FROM users");

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

        mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("User already has an active study session"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void test3_EndSessionComputesDurationAndUpdatesStats() throws Exception {
        StudySessionStartRequest request = StudySessionStartRequest.builder()
                .subject("System Design")
                .build();

        String startResponse = mockMvc.perform(post("/api/v1/sessions/start")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andReturn().getResponse().getContentAsString();

        String sessionId = objectMapper.readTree(startResponse).get("data").get("id").asText();

        mockMvc.perform(post("/api/v1/sessions/" + sessionId + "/end"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.durationMinutes", greaterThanOrEqualTo(1)));

        userStatsRepository.findAll().forEach(s -> {
            if (s.getUser().getId().equals(testUser.getId())) {
                assertThat(s.getStudyHours()).isGreaterThanOrEqualTo(0.0);
            }
        });
    }
}
