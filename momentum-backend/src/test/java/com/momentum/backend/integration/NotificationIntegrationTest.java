package com.momentum.backend.integration;

import com.momentum.backend.entity.*;
import com.momentum.backend.enums.*;
import com.momentum.backend.repository.*;
import com.momentum.backend.service.NotificationService;
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

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:notifdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
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
public class NotificationIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private JdbcTemplate jdbcTemplate;
    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;
    @Autowired private NotificationService notificationService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private UserStatsRepository userStatsRepository;

    @org.springframework.boot.test.mock.mockito.MockBean
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @org.springframework.boot.test.mock.mockito.MockBean
    private SimpMessagingTemplate messagingTemplate;

    private User testUser;

    @BeforeEach
    void setUp() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE notifications");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        testUser = userRepository.save(User.builder()
                .username("notif_user")
                .email("notif@test.com")
                .passwordHash(passwordEncoder.encode("pass"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build());

        userStatsRepository.save(UserStats.builder().user(testUser).build());
    }

    @Test
    @WithMockUser(username = "notif_user")
    void completingGoal_createsNotification_andUnreadCountReflectsIt() throws Exception {
        notificationService.createNotification(
                testUser.getId(),
                NotificationType.GOAL_COMPLETED,
                "Congratulations! You completed your goal: Complete 5 LeetCode problems",
                "{\"goalId\":\"" + UUID.randomUUID() + "\"}"
        );

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", is(1)));

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].type", is("GOAL_COMPLETED")))
                .andExpect(jsonPath("$.data.content[0].isRead", is(false)));
    }

    @Test
    @WithMockUser(username = "notif_user")
    void markAsRead_updatesIsRead() throws Exception {
        notificationService.createNotification(
                testUser.getId(),
                NotificationType.MILESTONE_REACHED,
                "Awesome! You've reached a 7-day streak milestone!",
                "{\"streakDays\":7}"
        );

        Notification notification = notificationRepository.findAll().get(0);
        assertThat(notification.isRead()).isFalse();

        mockMvc.perform(put("/api/v1/notifications/{id}/read", notification.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        Notification updated = notificationRepository.findById(notification.getId()).orElseThrow();
        assertThat(updated.isRead()).isTrue();

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data", is(0)));
    }

    @Test
    @WithMockUser(username = "notif_user")
    void markAllAsRead_updatesAllNotifications() throws Exception {
        notificationService.createNotification(testUser.getId(), NotificationType.GOAL_COMPLETED, "msg1", null);
        notificationService.createNotification(testUser.getId(), NotificationType.GROUP_JOINED, "msg2", null);

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(jsonPath("$.data", is(2)));

        mockMvc.perform(put("/api/v1/notifications/read-all"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/notifications/unread-count"))
                .andExpect(jsonPath("$.data", is(0)));
    }

    @Test
    @WithMockUser(username = "notif_user")
    void notificationsAreSortedUnreadFirst() throws Exception {
        notificationService.createNotification(testUser.getId(), NotificationType.GOAL_COMPLETED, "unread1", null);
        notificationService.createNotification(testUser.getId(), NotificationType.MILESTONE_REACHED, "read_one", null);

        Notification second = notificationRepository.findAll().stream()
                .filter(n -> n.getMessage().equals("read_one")).findFirst().orElseThrow();
        notificationService.markAsRead(second.getId(), "notif_user");

        mockMvc.perform(get("/api/v1/notifications"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].isRead", is(false)));
    }
}
