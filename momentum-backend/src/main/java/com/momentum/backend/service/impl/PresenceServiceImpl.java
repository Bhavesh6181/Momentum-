package com.momentum.backend.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.PresenceInfo;
import com.momentum.backend.dto.response.MemberPresenceResponse;
import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.PresenceStatus;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.PresenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
@Slf4j
public class PresenceServiceImpl implements PresenceService {

    private static final String PRESENCE_KEY_PREFIX = "presence:";
    private static final String DISCONNECT_KEY_PREFIX = "presence:disconnect:";
    private static final long PRESENCE_TTL_SECONDS = 300L; // 5 minutes

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ObjectMapper objectMapper;

    public PresenceServiceImpl(
            StringRedisTemplate redisTemplate,
            UserRepository userRepository,
            GroupMemberRepository groupMemberRepository,
            SimpMessagingTemplate simpMessagingTemplate,
            ObjectMapper objectMapper
    ) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.objectMapper = objectMapper;
    }

    @Override
    public void updatePresence(String username, PresenceStatus status) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        PresenceInfo info = PresenceInfo.builder()
                .status(status)
                .lastActive(Instant.now())
                .build();

        try {
            String json = objectMapper.writeValueAsString(info);
            redisTemplate.opsForValue().set(
                    PRESENCE_KEY_PREFIX + user.getId(),
                    json,
                    PRESENCE_TTL_SECONDS,
                    TimeUnit.SECONDS
            );
            // Cancel any pending disconnect
            redisTemplate.delete(DISCONNECT_KEY_PREFIX + user.getId());

            broadcastStatus(user, info);
        } catch (Exception e) {
            log.error("Failed to update presence in Redis for user {}", username, e);
        }
    }

    @Override
    public PresenceInfo getPresence(UUID userId) {
        try {
            String json = redisTemplate.opsForValue().get(PRESENCE_KEY_PREFIX + userId);
            if (json != null) {
                return objectMapper.readValue(json, PresenceInfo.class);
            }
        } catch (Exception e) {
            log.error("Failed to read presence from Redis for user {}", userId, e);
        }
        return PresenceInfo.builder()
                .status(PresenceStatus.OFFLINE)
                .lastActive(Instant.EPOCH)
                .build();
    }

    @Override
    public List<MemberPresenceResponse> getOnlineMembers(UUID groupId) {
        List<GroupMember> activeMembers = groupMemberRepository.findByGroupIdAndStatus(groupId, GroupMembershipStatus.ACTIVE);

        return activeMembers.stream().map(gm -> {
            User user = gm.getUser();
            PresenceInfo info = getPresence(user.getId());
            return MemberPresenceResponse.builder()
                    .userId(user.getId())
                    .username(user.getUsername())
                    .status(info.getStatus())
                    .lastActive(info.getLastActive())
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public void handleDisconnect(String username) {
        userRepository.findByUsername(username).ifPresent(user -> {
            try {
                // Record the disconnect timestamp in Redis
                String nowStr = String.valueOf(Instant.now().toEpochMilli());
                redisTemplate.opsForValue().set(
                        DISCONNECT_KEY_PREFIX + user.getId(),
                        nowStr,
                        60L,
                        TimeUnit.SECONDS // TTL of 60s is enough
                );
                log.info("Registered pending disconnect for user: {}", username);
            } catch (Exception e) {
                log.error("Failed to register disconnect in Redis for user {}", username, e);
            }
        });
    }

    @Override
    public void processDebouncedDisconnects() {
        try {
            Set<String> disconnectKeys = redisTemplate.keys(DISCONNECT_KEY_PREFIX + "*");
            if (disconnectKeys == null || disconnectKeys.isEmpty()) {
                return;
            }

            Instant now = Instant.now();

            for (String key : disconnectKeys) {
                String userIdStr = key.substring(DISCONNECT_KEY_PREFIX.length());
                UUID userId = UUID.fromString(userIdStr);

                String val = redisTemplate.opsForValue().get(key);
                if (val != null) {
                    long disconnectEpoch = Long.parseLong(val);
                    Instant disconnectTime = Instant.ofEpochMilli(disconnectEpoch);

                    if (Duration.between(disconnectTime, now).toSeconds() >= 30) {
                        // Mark user as AWAY after grace period (30s debounce)
                        Optional<User> userOpt = userRepository.findById(userId);
                        if (userOpt.isPresent()) {
                            User user = userOpt.get();
                            
                            // Verify no newer heartbeat updated the status
                            PresenceInfo currentPresence = getPresence(userId);
                            if (currentPresence.getLastActive().isBefore(disconnectTime)) {
                                PresenceInfo awayPresence = PresenceInfo.builder()
                                        .status(PresenceStatus.AWAY)
                                        .lastActive(disconnectTime)
                                        .build();

                                // Update Redis to AWAY
                                String json = objectMapper.writeValueAsString(awayPresence);
                                redisTemplate.opsForValue().set(
                                        PRESENCE_KEY_PREFIX + userId,
                                        json,
                                        PRESENCE_TTL_SECONDS,
                                        TimeUnit.SECONDS
                                );

                                log.info("Debounce finished. User {} marked AWAY.", user.getUsername());
                                broadcastStatus(user, awayPresence);
                            }
                        }
                        redisTemplate.delete(key);
                    }
                }
            }
        } catch (Exception e) {
            log.error("Error processing debounced disconnects in Redis", e);
        }
    }

    private void broadcastStatus(User user, PresenceInfo info) {
        List<GroupMember> memberships = groupMemberRepository.findByUserId(user.getId());
        List<UUID> activeGroupIds = memberships.stream()
                .filter(m -> m.getStatus() == GroupMembershipStatus.ACTIVE)
                .map(m -> m.getGroup().getId())
                .collect(Collectors.toList());

        MemberPresenceResponse response = MemberPresenceResponse.builder()
                .userId(user.getId())
                .username(user.getUsername())
                .status(info.getStatus())
                .lastActive(info.getLastActive())
                .build();

        for (UUID groupId : activeGroupIds) {
            String destination = "/topic/group/" + groupId + "/presence";
            simpMessagingTemplate.convertAndSend(destination, response);
            log.debug("Broadcasted presence change of {} to {}", user.getUsername(), destination);
        }
    }
}
