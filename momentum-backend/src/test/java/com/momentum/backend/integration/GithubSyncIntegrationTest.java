package com.momentum.backend.integration;

import com.momentum.backend.dto.response.GithubSyncResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.*;
import com.momentum.backend.service.GithubService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:githubdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
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
public class GithubSyncIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @MockBean private GithubService githubService;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @MockBean private SimpMessagingTemplate messagingTemplate;

    private User testUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        testUser = userRepository.save(User.builder()
                .username("github_user")
                .email("github@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());

        userStatsRepository.save(UserStats.builder().user(testUser).build());
    }

    @Test
    @WithMockUser(username = "github_user")
    void syncGithub_returnsRepoActivitiesFromMockedService() throws Exception {
        GithubSyncResponse.RepoActivity repo1 = GithubSyncResponse.RepoActivity.builder()
                .repoName("octocat/leetcode")
                .lastCommitSha("abc123")
                .lastCommitMessage("Add LeetCode solution #42")
                .newCommitsCount(0)
                .build();

        GithubSyncResponse.RepoActivity repo2 = GithubSyncResponse.RepoActivity.builder()
                .repoName("octocat/solutions")
                .lastCommitSha("def456")
                .lastCommitMessage("Fix NullPointerException in TreeNode")
                .newCommitsCount(2)
                .build();

        GithubSyncResponse response = GithubSyncResponse.builder()
                .githubUsername("octocat")
                .repoCount(2)
                .contributionCount(15)
                .recentRepositories(List.of(repo1, repo2))
                .syncedAt(OffsetDateTime.now())
                .build();

        when(githubService.syncGithubActivity(any(UUID.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/github/sync/{userId}", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.githubUsername", is("octocat")))
                .andExpect(jsonPath("$.data.repoCount", is(2)))
                .andExpect(jsonPath("$.data.contributionCount", is(15)))
                .andExpect(jsonPath("$.data.recentRepositories", hasSize(2)))
                .andExpect(jsonPath("$.data.recentRepositories[1].newCommitsCount", is(2)));
    }

    @Test
    @WithMockUser(username = "github_user")
    void getCachedActivity_returnsFromService() throws Exception {
        GithubSyncResponse response = GithubSyncResponse.builder()
                .githubUsername("octocat")
                .repoCount(3)
                .contributionCount(7)
                .recentRepositories(List.of())
                .syncedAt(OffsetDateTime.now())
                .build();

        when(githubService.getCachedActivity(any(UUID.class))).thenReturn(response);

        mockMvc.perform(get("/api/v1/github/{userId}/activity", testUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.githubUsername", is("octocat")))
                .andExpect(jsonPath("$.data.recentRepositories", hasSize(0)));
    }
}
