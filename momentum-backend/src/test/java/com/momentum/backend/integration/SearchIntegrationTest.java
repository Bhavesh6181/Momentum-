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

import static org.hamcrest.Matchers.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:searchdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
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
public class SearchIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private GroupRepository groupRepository;
    @Autowired private GroupMemberRepository groupMemberRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private UserProfileRepository userProfileRepository;
    @Autowired private PasswordEncoder passwordEncoder;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @org.springframework.boot.test.mock.mockito.MockBean
    private SimpMessagingTemplate messagingTemplate;

    private User searchUser;
    private Group publicGroup;
    private Group privateGroup;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE group_members");
        jdbcTemplate.execute("TRUNCATE TABLE groups");
        jdbcTemplate.execute("TRUNCATE TABLE user_profiles");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        searchUser = userRepository.save(User.builder()
                .username("search_user")
                .email("search@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());

        userStatsRepository.save(UserStats.builder().user(searchUser).build());

        userProfileRepository.save(UserProfile.builder()
                .user(searchUser)
                .name("Alice Search")
                .build());

        publicGroup = groupRepository.save(Group.builder()
                .name("LeetCode Grind")
                .description("Daily LeetCode practice")
                .isPrivate(false)
                .inviteCode("PUBLIC-CODE-1")
                .createdBy(searchUser)
                .build());

        privateGroup = groupRepository.save(Group.builder()
                .name("Secret Study Club")
                .description("Private study group")
                .isPrivate(true)
                .inviteCode("PRIV-CODE-1")
                .createdBy(searchUser)
                .build());
    }

    @Test
    @WithMockUser(username = "search_user")
    void search_findsPublicGroup_byPartialName() throws Exception {
        mockMvc.perform(get("/api/v1/search").param("q", "LeetCode"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.groups[*].name", hasItem(containsString("LeetCode"))));
    }

    @Test
    void search_doesNotExpose_privateGroupToNonMember() throws Exception {
        User outsider = userRepository.save(User.builder()
                .username("outsider_user")
                .email("outsider@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());
        userStatsRepository.save(UserStats.builder().user(outsider).build());

        mockMvc.perform(get("/api/v1/search")
                        .param("q", "Secret")
                        .with(user("outsider_user")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.groups[*].name",
                        not(hasItem(containsString("Secret")))));
    }

    @Test
    @WithMockUser(username = "search_user")
    void search_findsMemberPrivateGroup() throws Exception {
        // searchUser is a member of privateGroup — they SHOULD see it
        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(privateGroup.getId(), searchUser.getId()))
                .group(privateGroup)
                .user(searchUser)
                .role(GroupRole.MEMBER)
                .status(GroupMembershipStatus.ACTIVE)
                .build());

        mockMvc.perform(get("/api/v1/search").param("q", "Secret"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.groups[*].name",
                        hasItem(containsString("Secret"))));
    }

    @Test
    @WithMockUser(username = "search_user")
    void search_findsUserByName() throws Exception {
        mockMvc.perform(get("/api/v1/search").param("q", "Alice"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.users[*].name",
                        hasItem(containsString("Alice"))));
    }

    @Test
    @WithMockUser(username = "search_user")
    void search_emptyQuery_returnsBadRequest() throws Exception {
        mockMvc.perform(get("/api/v1/search").param("q", ""))
                .andExpect(status().is4xxClientError());
    }
}
