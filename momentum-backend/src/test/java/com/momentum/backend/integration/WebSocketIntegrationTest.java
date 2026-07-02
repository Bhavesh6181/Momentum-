package com.momentum.backend.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.request.StudySessionStartRequest;
import com.momentum.backend.dto.response.ActivityResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.enums.Role;
import com.momentum.backend.repository.*;
import com.momentum.backend.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.messaging.converter.MappingJackson2MessageConverter;
import org.springframework.messaging.simp.stomp.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.messaging.WebSocketStompClient;
import org.springframework.web.socket.sockjs.client.SockJsClient;
import org.springframework.web.socket.sockjs.client.Transport;
import org.springframework.web.socket.sockjs.client.WebSocketTransport;

import java.lang.reflect.Type;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
        "spring.datasource.url=jdbc:h2:mem:websocketdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL;NON_KEYWORDS=value",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=update",
        "spring.flyway.enabled=false",
        "spring.jpa.properties.hibernate.type.preferred_enum_jdbc_type=VARCHAR",
        "management.health.redis.enabled=false",
        "spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.data.redis.RedisAutoConfiguration,org.springframework.boot.autoconfigure.data.redis.RedisReactiveAutoConfiguration"
    }
)
public class WebSocketIntegrationTest {

    @LocalServerPort
    private int port;

    @MockBean
    private StringRedisTemplate redisTemplate;

    @Autowired private UserRepository userRepository;
    @Autowired private UserStatsRepository userStatsRepository;
    @Autowired private GroupRepository groupRepository;
    @Autowired private GroupMemberRepository groupMemberRepository;
    @Autowired private StudySessionRepository studySessionRepository;
    @Autowired private JwtService jwtService;
    @Autowired private PasswordEncoder passwordEncoder;
    @Autowired private JdbcTemplate jdbcTemplate;

    private User testUser;
    private Group testGroup;
    private String validToken;
    private String wsUrl;

    @BeforeEach
    void setup() {
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY FALSE");
        jdbcTemplate.execute("TRUNCATE TABLE study_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE pomodoro_sessions");
        jdbcTemplate.execute("TRUNCATE TABLE challenge_participants");
        jdbcTemplate.execute("TRUNCATE TABLE challenges");
        jdbcTemplate.execute("TRUNCATE TABLE goals");
        jdbcTemplate.execute("TRUNCATE TABLE group_members");
        jdbcTemplate.execute("TRUNCATE TABLE groups");
        jdbcTemplate.execute("TRUNCATE TABLE refresh_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE audit_logs");
        jdbcTemplate.execute("TRUNCATE TABLE user_verification_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE password_reset_tokens");
        jdbcTemplate.execute("TRUNCATE TABLE user_profiles");
        jdbcTemplate.execute("TRUNCATE TABLE user_stats");
        jdbcTemplate.execute("TRUNCATE TABLE users");
        jdbcTemplate.execute("SET REFERENTIAL_INTEGRITY TRUE");

        testUser = User.builder()
                .username("wstestuser")
                .email("wstest@example.com")
                .passwordHash(passwordEncoder.encode("password123"))
                .role(Role.STUDENT)
                .emailVerified(true)
                .build();
        userRepository.save(testUser);
        userStatsRepository.save(UserStats.builder().user(testUser).build());

        testGroup = groupRepository.save(Group.builder()
                .name("WS Test Group")
                .description("Testing WS")
                .createdBy(testUser)
                .inviteCode("WSINVITE")
                .isPrivate(false)
                .build());

        groupMemberRepository.save(GroupMember.builder()
                .id(new GroupMemberId(testGroup.getId(), testUser.getId()))
                .group(testGroup)
                .user(testUser)
                .role(GroupRole.ADMIN)
                .status(GroupMembershipStatus.ACTIVE)
                .build());

        validToken = jwtService.generateAccessToken(testUser.getUsername());
        wsUrl = "ws://localhost:" + port + "/ws";
    }

    @Test
    void testWebSocketConnectionAndActivityBroadcast() throws Exception {
        // Setup WebSocket Client
        List<Transport> transports = Collections.singletonList(new WebSocketTransport(new StandardWebSocketClient()));
        SockJsClient sockJsClient = new SockJsClient(transports);
        WebSocketStompClient stompClient = new WebSocketStompClient(sockJsClient);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        // Connect with valid token as query param
        String connectUrl = wsUrl + "?token=" + validToken;
        BlockingQueue<ActivityResponse> receivedMessages = new LinkedBlockingDeque<>();

        StompSession session = stompClient.connectAsync(connectUrl, new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);
        assertThat(session.isConnected()).isTrue();

        // Subscribe to /topic/group/{groupId}/activity
        String topic = "/topic/group/" + testGroup.getId() + "/activity";
        session.subscribe(topic, new StompFrameHandler() {
            @Override
            public Type getPayloadType(StompHeaders headers) {
                return ActivityResponse.class;
            }

            @Override
            public void handleFrame(StompHeaders headers, Object payload) {
                receivedMessages.add((ActivityResponse) payload);
            }
        });

        // Trigger a session start and end via REST API
        StudySession studySession = StudySession.builder()
                .user(testUser)
                .group(testGroup)
                .subject("WebSocket Mechanics")
                .goal("Understand STOMP frames")
                .startTime(java.time.OffsetDateTime.now().minusMinutes(10))
                .status(com.momentum.backend.enums.SessionStatus.ACTIVE)
                .build();
        studySessionRepository.save(studySession);

        RestTemplate restTemplate = new RestTemplate();
        String url = "http://localhost:" + port + "/api/v1/sessions/" + studySession.getId() + "/end";
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(validToken);
        org.springframework.http.HttpEntity<Void> entity = new org.springframework.http.HttpEntity<>(headers);
        
        restTemplate.postForEntity(url, entity, String.class);

        // Assert broadcast received within 2 seconds
        ActivityResponse broadcast = receivedMessages.poll(2, TimeUnit.SECONDS);
        assertThat(broadcast).isNotNull();
        assertThat(broadcast.getType()).isEqualTo(com.momentum.backend.enums.ActivityType.SESSION_COMPLETED);
        assertThat(broadcast.getGroupId()).isEqualTo(testGroup.getId());
        assertThat(broadcast.getUsername()).isEqualTo(testUser.getUsername());

        session.disconnect();
    }

    @Test
    void testConnectionRejectedWithInvalidToken() {
        List<Transport> transports = Collections.singletonList(new WebSocketTransport(new StandardWebSocketClient()));
        SockJsClient sockJsClient = new SockJsClient(transports);
        WebSocketStompClient stompClient = new WebSocketStompClient(sockJsClient);
        stompClient.setMessageConverter(new MappingJackson2MessageConverter());

        // Connect with invalid token
        String invalidConnectUrl = wsUrl + "?token=invalid-jwt-token";

        assertThrows(Exception.class, () -> {
            stompClient.connectAsync(invalidConnectUrl, new StompSessionHandlerAdapter() {}).get(5, TimeUnit.SECONDS);
        });
    }
}
