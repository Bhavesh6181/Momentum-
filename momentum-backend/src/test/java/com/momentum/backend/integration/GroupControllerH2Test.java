package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.GroupCreateRequest;
import com.momentum.backend.dto.request.GroupJoinRequest;
import com.momentum.backend.entity.Group;
import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.GroupMemberId;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.GroupRepository;
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

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:groupdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL",
    "spring.datasource.driver-class-name=org.h2.Driver",
    "spring.datasource.username=sa",
    "spring.datasource.password=",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
    "spring.jpa.hibernate.ddl-auto=update",
    "spring.flyway.enabled=false"
})
@AutoConfigureMockMvc
public class GroupControllerH2Test {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Autowired
    private GroupMemberRepository groupMemberRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    private User adminUser;
    private User regularUser;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("DELETE FROM refresh_tokens");
        jdbcTemplate.execute("DELETE FROM audit_logs");
        jdbcTemplate.execute("DELETE FROM group_members");
        jdbcTemplate.execute("DELETE FROM groups");
        jdbcTemplate.execute("DELETE FROM user_profiles");
        jdbcTemplate.execute("DELETE FROM user_stats");
        jdbcTemplate.execute("DELETE FROM user_verification_tokens");
        jdbcTemplate.execute("DELETE FROM password_reset_tokens");
        jdbcTemplate.execute("DELETE FROM users");

        adminUser = User.builder()
                .username("adminuser")
                .email("admin@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(adminUser);

        regularUser = User.builder()
                .username("regularuser")
                .email("regular@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(regularUser);
    }

    @Test
    @WithMockUser(username = "adminuser")
    void test1_CreateGroupMakesYouAdmin() throws Exception {
        GroupCreateRequest request = GroupCreateRequest.builder()
                .name("Study Group A")
                .description("Focus study sessions")
                .isPrivate(false)
                .build();

        mockMvc.perform(post("/api/v1/groups")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Study Group A"))
                .andExpect(jsonPath("$.data.inviteCode").exists())
                .andExpect(jsonPath("$.data.createdBy").value("adminuser"));

        Group group = groupRepository.findAll().get(0);
        GroupMemberId id = new GroupMemberId(group.getId(), adminUser.getId());
        GroupMember member = groupMemberRepository.findById(id).orElseThrow();
        assertThat(member.getRole()).isEqualTo(GroupRole.ADMIN);
    }

    @Test
    @WithMockUser(username = "regularuser")
    void test2_JoinViaValidInviteCodeAddsAsMember() throws Exception {
        Group group = Group.builder()
                .name("Group B")
                .inviteCode("CODE123")
                .createdBy(adminUser)
                .isPrivate(true)
                .build();
        groupRepository.save(group);

        GroupJoinRequest request = GroupJoinRequest.builder()
                .inviteCode("CODE123")
                .build();

        mockMvc.perform(post("/api/v1/groups/" + group.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        GroupMemberId id = new GroupMemberId(group.getId(), regularUser.getId());
        GroupMember member = groupMemberRepository.findById(id).orElseThrow();
        assertThat(member.getRole()).isEqualTo(GroupRole.MEMBER);
    }

    @Test
    @WithMockUser(username = "regularuser")
    void test3_JoinWithInvalidCodeFails() throws Exception {
        Group group = Group.builder()
                .name("Group C")
                .inviteCode("CODE123")
                .createdBy(adminUser)
                .isPrivate(true)
                .build();
        groupRepository.save(group);

        GroupJoinRequest request = GroupJoinRequest.builder()
                .inviteCode("WRONGCODE")
                .build();

        mockMvc.perform(post("/api/v1/groups/" + group.getId() + "/join")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Invalid invite code"));
    }

    @Test
    @WithMockUser(username = "regularuser")
    void test4_NonAdminHittingAdminOnlyEndpointGetsForbidden() throws Exception {
        Group group = Group.builder()
                .name("Group D")
                .inviteCode("CODE123")
                .createdBy(adminUser)
                .isPrivate(false)
                .build();
        groupRepository.save(group);

        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(group.getId(), regularUser.getId()))
                .group(group)
                .user(regularUser)
                .role(GroupRole.MEMBER)
                .build());

        mockMvc.perform(delete("/api/v1/groups/" + group.getId()))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "adminuser")
    void test5_AdminSuccessfullyRemovesMember() throws Exception {
        Group group = Group.builder()
                .name("Group E")
                .inviteCode("CODE123")
                .createdBy(adminUser)
                .isPrivate(false)
                .build();
        groupRepository.save(group);

        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(group.getId(), adminUser.getId()))
                .group(group)
                .user(adminUser)
                .role(GroupRole.ADMIN)
                .build());

        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(group.getId(), regularUser.getId()))
                .group(group)
                .user(regularUser)
                .role(GroupRole.MEMBER)
                .build());

        mockMvc.perform(delete("/api/v1/groups/" + group.getId() + "/members/" + regularUser.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        GroupMemberId id = new GroupMemberId(group.getId(), regularUser.getId());
        assertThat(groupMemberRepository.existsById(id)).isFalse();
    }
}
