package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.UserRepository;
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

import java.util.ArrayList;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:profiledb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
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
public class UserProfileControllerH2Test {

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

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

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

    private void createMockUser(String username, String email) {
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        user.setProfile(UserProfile.builder().user(user).skills(new ArrayList<>()).college("Initial College").build());
        user.setStats(UserStats.builder().user(user).studyHours(5.5).build());
        userRepository.save(user);
    }

    @Test
    @WithMockUser(username = "testuser")
    void test1_FetchOwnProfile() throws Exception {
        createMockUser("testuser", "testuser@example.com");

        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("testuser"))
                .andExpect(jsonPath("$.data.email").value("testuser@example.com"))
                .andExpect(jsonPath("$.data.profile.college").value("Initial College"))
                .andExpect(jsonPath("$.data.stats.studyHours").value(5.5))
                .andExpect(jsonPath("$.data.profileCompletion").value(9)); // only 'college' is non-blank (1/11 ~ 9%)
    }

    @Test
    @WithMockUser(username = "testuser")
    void test2_UpdateProfileWithValidData() throws Exception {
        createMockUser("testuser", "testuser@example.com");

        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .name("Updated Name")
                .college("Updated College")
                .targetPackage("12.5")
                .githubLink("https://github.com/testuser")
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.profile.name").value("Updated Name"))
                .andExpect(jsonPath("$.data.profile.college").value("Updated College"))
                .andExpect(jsonPath("$.data.profile.targetPackage").value("12.5"))
                .andExpect(jsonPath("$.data.profile.githubLink").value("https://github.com/testuser"));
    }

    @Test
    @WithMockUser(username = "testuser")
    void test3_UpdateProfileWithInvalidData() throws Exception {
        createMockUser("testuser", "testuser@example.com");

        UserProfileUpdateRequest request = UserProfileUpdateRequest.builder()
                .targetPackage("-10.0")
                .githubLink("invalid-url")
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Validation failed"))
                .andExpect(jsonPath("$.data.targetPackage").exists())
                .andExpect(jsonPath("$.data.githubLink").exists());
    }

    @Test
    @WithMockUser(username = "testuser")
    void test4_FetchAnotherUserPublicProfile() throws Exception {
        createMockUser("testuser", "testuser@example.com");
        createMockUser("otheruser", "otheruser@example.com");

        mockMvc.perform(get("/api/v1/users/otheruser/public"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.username").value("otheruser"))
                .andExpect(jsonPath("$.data.profile.college").value("Initial College"))
                .andExpect(jsonPath("$.data.stats.studyHours").value(5.5))
                .andExpect(jsonPath("$.data.email").doesNotExist())
                .andExpect(jsonPath("$.data.id").doesNotExist())
                .andExpect(jsonPath("$.data.role").doesNotExist());
    }

    @Test
    void test5_AccessMeWithoutAuthFails() throws Exception {
        mockMvc.perform(get("/api/v1/users/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @WithMockUser(username = "testuser")
    void test6_OptimisticLockingConflict() throws Exception {
        createMockUser("testuser", "testuser@example.com");

        // Initial edit: version 0 -> version 1
        UserProfileUpdateRequest request1 = UserProfileUpdateRequest.builder()
                .name("First Edit")
                .version(0L)
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request1)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.profile.name").value("First Edit"));

        // Stale edit: sends stale version 0 which conflicts with version 1 in DB
        UserProfileUpdateRequest request2 = UserProfileUpdateRequest.builder()
                .name("Stale Edit")
                .version(0L)
                .build();

        mockMvc.perform(patch("/api/v1/users/me")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request2)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("The resource has been updated by another transaction. Please reload and try again."));
    }
}
