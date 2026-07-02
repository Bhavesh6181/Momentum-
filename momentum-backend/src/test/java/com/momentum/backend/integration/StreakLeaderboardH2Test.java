package com.momentum.backend.integration;

import com.momentum.backend.config.StreakProperties;
import com.momentum.backend.dto.response.LeaderboardEntryResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.enums.Role;
import com.momentum.backend.event.StreakMilestoneEvent;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.repository.UserStatsRepository;
import com.momentum.backend.service.StreakService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.DefaultTypedTuple;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.event.ApplicationEvents;
import org.springframework.test.context.event.RecordApplicationEvents;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Clock;
import java.time.Instant;
import java.time.ZoneId;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:streakdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.flyway.enabled=false",
    "spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=VARCHAR",
    "management.health.redis.enabled=false",
    "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration",
    "app.streak.min-study-minutes=15"
})
@AutoConfigureMockMvc
@RecordApplicationEvents
public class StreakLeaderboardH2Test {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserStatsRepository userStatsRepository;

    @Autowired
    private StreakService streakService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ApplicationEvents applicationEvents;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @MockBean
    private Clock clock;

    private User userA;
    private User userB;
    private User userC;

    @SuppressWarnings("unchecked")
    @BeforeEach
    void setup() {
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM user_stats");
        jdbcTemplate.execute("DELETE FROM user_profiles");
        jdbcTemplate.execute("DELETE FROM users");

        // Seed 3 Users with profile & stats
        userA = createUser("usera", "usera@test.com", "User Alpha");
        userB = createUser("userb", "userb@test.com", "User Beta");
        userC = createUser("userc", "userc@test.com", "User Gamma");

        // Configure default clock mock to fixed instant: 2026-07-02T12:00:00Z
        Instant fixedInstant = Instant.parse("2026-07-02T12:00:00Z");
        when(clock.instant()).thenReturn(fixedInstant);
        when(clock.getZone()).thenReturn(ZoneId.of("UTC"));

        // Mock Redis value and zset operations
        ZSetOperations<String, String> zSetOps = Mockito.mock(ZSetOperations.class);
        when(redisTemplate.opsForZSet()).thenReturn(zSetOps);

        org.springframework.data.redis.core.ValueOperations<String, String> valOps = Mockito.mock(org.springframework.data.redis.core.ValueOperations.class);
        when(redisTemplate.opsForValue()).thenReturn(valOps);
    }

    private User createUser(String username, String email, String name) {
        User user = User.builder()
                .username(username)
                .email(email)
                .passwordHash(passwordEncoder.encode("Password123!"))
                .role(Role.STUDENT)
                .build();
        user = userRepository.save(user);

        UserProfile profile = UserProfile.builder()
                .user(user)
                .name(name)
                .build();
        user.setProfile(profile);

        UserStats stats = UserStats.builder()
                .user(user)
                .studyHours(0.0)
                .currentStreak(0)
                .longestStreak(0)
                .build();
        user.setStats(stats);

        userRepository.save(user);
        return user;
    }

    @Test
    @WithMockUser(username = "usera")
    void test1_LeaderboardRetrievalAndHydration() throws Exception {
        // Setup Redis mock to return: User C (score 5.0), User B (score 3.0), User A (score 1.5)
        Set<TypedTuple<String>> mockZSetResults = new LinkedHashSet<>();
        mockZSetResults.add(new DefaultTypedTuple<>(userC.getId().toString(), 5.0));
        mockZSetResults.add(new DefaultTypedTuple<>(userB.getId().toString(), 3.0));
        mockZSetResults.add(new DefaultTypedTuple<>(userA.getId().toString(), 1.5));

        when(redisTemplate.opsForZSet().reverseRangeWithScores(anyString(), anyLong(), anyLong()))
                .thenReturn(mockZSetResults);

        // Fetch leaderboard via REST endpoint
        mockMvc.perform(get("/api/v1/groups/global/leaderboard")
                        .param("type", "studyHours")
                        .param("range", "weekly")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                // User C: Rank 1
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].userId").value(userC.getId().toString()))
                .andExpect(jsonPath("$[0].username").value("userc"))
                .andExpect(jsonPath("$[0].name").value("User Gamma"))
                .andExpect(jsonPath("$[0].score").value(5.0))
                // User B: Rank 2
                .andExpect(jsonPath("$[1].rank").value(2))
                .andExpect(jsonPath("$[1].userId").value(userB.getId().toString()))
                .andExpect(jsonPath("$[1].username").value("userb"))
                .andExpect(jsonPath("$[1].name").value("User Beta"))
                .andExpect(jsonPath("$[1].score").value(3.0))
                // User A: Rank 3
                .andExpect(jsonPath("$[2].rank").value(3))
                .andExpect(jsonPath("$[2].userId").value(userA.getId().toString()))
                .andExpect(jsonPath("$[2].username").value("usera"))
                .andExpect(jsonPath("$[2].name").value("User Alpha"))
                .andExpect(jsonPath("$[2].score").value(1.5));
    }

    @Test
    void test2_NightlyStreakResetJob() {
        // Setup initial streaks in database
        // User A: streak 1, longest 1
        UserStats statsA = userStatsRepository.findByUserId(userA.getId()).orElseThrow();
        statsA.setCurrentStreak(1);
        statsA.setLongestStreak(1);
        userStatsRepository.save(statsA);

        // User B: streak 6, longest 6 (will hit 7-day milestone!)
        UserStats statsB = userStatsRepository.findByUserId(userB.getId()).orElseThrow();
        statsB.setCurrentStreak(6);
        statsB.setLongestStreak(6);
        userStatsRepository.save(statsB);

        // User C: streak 3, longest 3 (will reset to 0)
        UserStats statsC = userStatsRepository.findByUserId(userC.getId()).orElseThrow();
        statsC.setCurrentStreak(3);
        statsC.setLongestStreak(3);
        userStatsRepository.save(statsC);

        // Date under evaluation is yesterday: 2026-07-01
        String yesterdayStr = "2026-07-01";

        // Mock daily activity records in Redis:
        // User A studied 20 minutes (>= 15 threshold)
        when(redisTemplate.opsForValue().get("user:streak:study-minutes:" + userA.getId() + ":" + yesterdayStr))
                .thenReturn("20");

        // User B completed 1 goal
        when(redisTemplate.opsForValue().get("user:streak:goals:" + userB.getId() + ":" + yesterdayStr))
                .thenReturn("1");

        // User C studied only 5 minutes and completed no goals
        when(redisTemplate.opsForValue().get("user:streak:study-minutes:" + userC.getId() + ":" + yesterdayStr))
                .thenReturn("5");

        // Run nightly streaks evaluation
        streakService.evaluateNightlyStreaks();

        // Hydrate updated stats from database
        UserStats updatedA = userStatsRepository.findByUserId(userA.getId()).orElseThrow();
        UserStats updatedB = userStatsRepository.findByUserId(userB.getId()).orElseThrow();
        UserStats updatedC = userStatsRepository.findByUserId(userC.getId()).orElseThrow();

        // Assertions:
        // User A met threshold -> streak increments to 2, longest becomes 2
        assertThat(updatedA.getCurrentStreak()).isEqualTo(2);
        assertThat(updatedA.getLongestStreak()).isEqualTo(2);

        // User B met threshold -> streak increments to 7, longest becomes 7
        assertThat(updatedB.getCurrentStreak()).isEqualTo(7);
        assertThat(updatedB.getLongestStreak()).isEqualTo(7);

        // User C missed threshold -> streak resets to 0, longest stays 3
        assertThat(updatedC.getCurrentStreak()).isEqualTo(0);
        assertThat(updatedC.getLongestStreak()).isEqualTo(3);

        // Confirm Milestone event was fired for User B hitting 7 days!
        long milestoneEventsCount = applicationEvents.stream(StreakMilestoneEvent.class)
                .filter(e -> e.getStreakDays() == 7 && e.getUserId().equals(userB.getId()))
                .count();
        assertThat(milestoneEventsCount).isEqualTo(1);
    }
}
