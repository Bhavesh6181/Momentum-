package com.momentum.backend.integration;

import com.momentum.backend.entity.Group;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Testcontainers
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Disabled("Disabled by default as it requires a running Docker daemon")
public class RepositoryIntegrationTest {

    @Container
    @ServiceConnection
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroupRepository groupRepository;

    @Test
    void testSaveAndFindUserAndGroup() {
        // 1. Create and save a User
        User user = User.builder()
                .username("testuser_" + UUID.randomUUID().toString().substring(0, 8))
                .email("test_" + UUID.randomUUID().toString().substring(0, 8) + "@example.com")
                .passwordHash("hashed_password")
                .role(Role.STUDENT)
                .build();

        User savedUser = userRepository.save(user);
        assertThat(savedUser.getId()).isNotNull();

        Optional<User> foundUser = userRepository.findById(savedUser.getId());
        assertThat(foundUser).isPresent();
        assertThat(foundUser.get().getUsername()).isEqualTo(user.getUsername());

        // 2. Create and save a Group referencing that User
        Group group = Group.builder()
                .name("Study Group Alpha")
                .description("DSA practice group")
                .createdBy(savedUser)
                .inviteCode("ALPHA_" + UUID.randomUUID().toString().substring(0, 8))
                .isPrivate(false)
                .build();

        Group savedGroup = groupRepository.save(group);
        assertThat(savedGroup.getId()).isNotNull();

        Optional<Group> foundGroup = groupRepository.findById(savedGroup.getId());
        assertThat(foundGroup).isPresent();
        assertThat(foundGroup.get().getName()).isEqualTo("Study Group Alpha");
        assertThat(foundGroup.get().getCreatedBy().getId()).isEqualTo(savedUser.getId());
    }
}
