package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.LoginRequest;
import com.momentum.backend.dto.request.RegisterRequest;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.jdbc.core.JdbcTemplate;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Testcontainers
@Disabled("Disabled by default as it requires a running Docker daemon")
public class AuthControllerIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM user_profiles");
        jdbcTemplate.execute("DELETE FROM user_stats");
        jdbcTemplate.execute("DELETE FROM user_verification_tokens");
        jdbcTemplate.execute("DELETE FROM password_reset_tokens");
        jdbcTemplate.execute("DELETE FROM users");
    }

    @Test
    void test1_SuccessfulRegistration() throws Exception {
        RegisterRequest request = RegisterRequest.builder()
                .username("newuser")
                .email("newuser@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Registration successful. Please verify your email."));

        assertThat(userRepository.findByUsername("newuser")).isPresent();
    }

    @Test
    void test2_DuplicateEmailRegistrationFails() throws Exception {
        User existingUser = User.builder()
                .username("existing")
                .email("duplicate@example.com")
                .passwordHash(passwordEncoder.encode("password"))
                .role(Role.STUDENT)
                .build();
        userRepository.save(existingUser);

        RegisterRequest request = RegisterRequest.builder()
                .username("another")
                .email("duplicate@example.com")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email is already registered"));
    }

    @Test
    void test3_LoginWithCorrectCredentialsReturnsTokens() throws Exception {
        User user = User.builder()
                .username("loginuser")
                .email("loginuser@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("loginuser")
                .password("password123")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andExpect(jsonPath("$.data.user.username").value("loginuser"));
    }

    @Test
    void test4_LoginWithWrongPasswordFails() throws Exception {
        User user = User.builder()
                .username("loginuser")
                .email("loginuser@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .build();
        userRepository.save(user);

        LoginRequest request = LoginRequest.builder()
                .usernameOrEmail("loginuser")
                .password("wrongpassword")
                .build();

        mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void test5_AccessProtectedEndpointWithoutTokenFails() throws Exception {
        mockMvc.perform(get("/api/v1/protected-dummy-endpoint"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void test6_RefreshTokenFlowIssuesNewAccessToken() throws Exception {
        User user = User.builder()
                .username("refreshuser")
                .email("refreshuser@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(user);

        LoginRequest loginReq = LoginRequest.builder()
                .usernameOrEmail("refreshuser")
                .password("password123")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String responseBody = loginResult.getResponse().getContentAsString();
        String refreshToken = objectMapper.readTree(responseBody).get("data").get("refreshToken").asText();

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .param("token", refreshToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty());
    }
}
