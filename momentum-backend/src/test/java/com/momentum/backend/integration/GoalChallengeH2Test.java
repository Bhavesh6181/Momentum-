package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.ChallengeCreateRequest;
import com.momentum.backend.dto.request.GoalCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.*;
import com.momentum.backend.repository.*;
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

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:goaldb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.flyway.enabled=false",
        "spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=VARCHAR"
})
@AutoConfigureMockMvc
public class GoalChallengeH2Test {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private GroupRepository groupRepository;
    @Autowired private GroupMemberRepository groupMemberRepository;
    @Autowired private ChallengeRepository challengeRepository;
    @Autowired private ChallengeParticipantRepository challengeParticipantRepository;
    @Autowired private GoalRepository goalRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    private User adminUser;
    private User memberUser;
    private Group testGroup;

    @BeforeEach
    void setup() {
        // Disable FK checks so we can truncate in any order
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE challenge_participants");
        jdbcTemplate.execute("TRUNCATE TABLE challenges");
        jdbcTemplate.execute("TRUNCATE TABLE goals");
        jdbcTemplate.execute("TRUNCATE TABLE group_members");
        jdbcTemplate.execute("TRUNCATE TABLE groups");
        jdbcTemplate.execute("TRUNCATE TABLE study_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE pomodoro_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE refresh_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE audit_logs");
        jdbcTemplate.execute("TRUNCATE TABLE user_verification_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE password_reset_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE user_profiles");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");


        // Create admin user
        adminUser = userRepository.save(User.builder()
                .username("adminuser")
                .email("admin@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());
        userStatsRepository.save(UserStats.builder().user(adminUser).build());

        // Create member user
        memberUser = userRepository.save(User.builder()
                .username("memberuser")
                .email("member@example.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());
        userStatsRepository.save(UserStats.builder().user(memberUser).build());

        // Create group
        testGroup = groupRepository.save(Group.builder()
                .name("Test Group")
                .description("For testing")
                .createdBy(adminUser)
                .inviteCode("TESTCODE")
                .isPrivate(false)
                .build());

        // Make adminUser a group ADMIN
        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(testGroup.getId(), adminUser.getId()))
                .group(testGroup)
                .user(adminUser)
                .role(GroupRole.ADMIN)
                .status(GroupMembershipStatus.ACTIVE)
                .build());

        // Make memberUser a MEMBER
        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(testGroup.getId(), memberUser.getId()))
                .group(testGroup)
                .user(memberUser)
                .role(GroupRole.MEMBER)
                .status(GroupMembershipStatus.ACTIVE)
                .build());
    }

    // ──────────────────────────────────────────────────────────────────────
    // Test 1: Create personal goal returns 201 IN_PROGRESS
    // ──────────────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(username = "adminuser")
    void test1_CreatePersonalGoal_Returns201() throws Exception {
        GoalCreateRequest req = GoalCreateRequest.builder()
                .type(GoalType.DAILY)
                .title("Solve 10 DSA problems")
                .targetValue(10)
                .unit("problems")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(1))
                .build();

        mockMvc.perform(post("/api/v1/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Solve 10 DSA problems"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.data.progressPercent").value(0.0))
                .andExpect(jsonPath("$.data.groupId").doesNotExist());
    }

    // ──────────────────────────────────────────────────────────────────────
    // Test 2: Update progress to targetValue auto-completes the goal
    // ──────────────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(username = "adminuser")
    void test2_UpdateProgressToTarget_AutoCompletes() throws Exception {
        GoalCreateRequest create = GoalCreateRequest.builder()
                .type(GoalType.WEEKLY)
                .title("Study 5 hours")
                .targetValue(5)
                .unit("hours")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(7))
                .build();

        String createResp = mockMvc.perform(post("/api/v1/goals")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(create)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String goalId = objectMapper.readTree(createResp).get("data").get("id").asText();

        // Update to exactly the target value
        GoalProgressRequest progress = new GoalProgressRequest(5.0);
        mockMvc.perform(put("/api/v1/goals/" + goalId + "/progress")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(progress)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("COMPLETED"))
                .andExpect(jsonPath("$.data.currentValue").value(5.0))
                .andExpect(jsonPath("$.data.progressPercent").value(100.0));
    }

    // ──────────────────────────────────────────────────────────────────────
    // Test 3: Non-admin cannot create a group challenge → 403
    // ──────────────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(username = "memberuser")
    void test3_NonAdminCannotCreateChallenge_Returns403() throws Exception {
        ChallengeCreateRequest req = ChallengeCreateRequest.builder()
                .title("30-Day DSA Sprint")
                .targetValue(100)
                .unit("problems")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .build();

        mockMvc.perform(post("/api/v1/groups/" + testGroup.getId() + "/challenges")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isForbidden());
    }

    // ──────────────────────────────────────────────────────────────────────
    // Test 4: Joining a challenge twice is idempotent — no duplicate rows
    // ──────────────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(username = "memberuser")
    void test4_JoinChallengeTwiceIsIdempotent() throws Exception {
        // Admin creates the challenge first
        Challenge challenge = challengeRepository.save(Challenge.builder()
                .group(testGroup)
                .createdBy(adminUser)
                .title("Idempotency Challenge")
                .targetValue(50)
                .unit("problems")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(14))
                .status(ChallengeStatus.OPEN)
                .build());

        String challengeId = challenge.getId().toString();

        // Join once
        mockMvc.perform(post("/api/v1/challenges/" + challengeId + "/join"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("memberuser"))
                .andExpect(jsonPath("$.data.currentProgress").value(0.0));

        // Join again — should be 200, not 409
        mockMvc.perform(post("/api/v1/challenges/" + challengeId + "/join"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("memberuser"));

        // Verify only one participant row exists
        long count = challengeParticipantRepository.findAll().stream()
                .filter(p -> p.getUser().getId().equals(memberUser.getId())
                        && p.getChallenge().getId().equals(challenge.getId()))
                .count();
        assertThat(count).isEqualTo(1L);
    }

    // ──────────────────────────────────────────────────────────────────────
    // Test 5: Leaderboard returns participants sorted by progress DESC
    // ──────────────────────────────────────────────────────────────────────
    @Test
    @WithMockUser(username = "adminuser")
    void test5_LeaderboardSortedByProgressDesc() throws Exception {
        Challenge challenge = challengeRepository.save(Challenge.builder()
                .group(testGroup)
                .createdBy(adminUser)
                .title("Leaderboard Challenge")
                .targetValue(100)
                .unit("points")
                .startDate(LocalDate.now())
                .endDate(LocalDate.now().plusDays(30))
                .status(ChallengeStatus.OPEN)
                .build());

        // Admin joins with progress = 80
        ChallengeParticipant adminParticipant = ChallengeParticipant.builder()
                .id(new ChallengeParticipantId(challenge.getId(), adminUser.getId()))
                .challenge(challenge)
                .user(adminUser)
                .currentProgress(80.0)
                .build();
        challengeParticipantRepository.save(adminParticipant);

        // Member joins with progress = 40
        ChallengeParticipant memberParticipant = ChallengeParticipant.builder()
                .id(new ChallengeParticipantId(challenge.getId(), memberUser.getId()))
                .challenge(challenge)
                .user(memberUser)
                .currentProgress(40.0)
                .build();
        challengeParticipantRepository.save(memberParticipant);

        // Leaderboard should return admin first (80 > 40)
        mockMvc.perform(get("/api/v1/challenges/" + challenge.getId() + "/leaderboard"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(2)))
                .andExpect(jsonPath("$.data.content[0].username").value("adminuser"))
                .andExpect(jsonPath("$.data.content[0].currentProgress").value(80.0))
                .andExpect(jsonPath("$.data.content[1].username").value("memberuser"))
                .andExpect(jsonPath("$.data.content[1].currentProgress").value(40.0));
    }

    // ──────────────────────────────────────────────────────────────────────
    // Test 6: Unauthenticated access returns 401
    // ──────────────────────────────────────────────────────────────────────
    @Test
    void test6_UnauthenticatedAccess_Returns401() throws Exception {
        mockMvc.perform(get("/api/v1/goals/me"))
                .andExpect(status().isUnauthorized());
    }
}
