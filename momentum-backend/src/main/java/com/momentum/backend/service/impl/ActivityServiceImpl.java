package com.momentum.backend.service.impl;

import com.momentum.backend.dto.response.ActivityResponse;
import com.momentum.backend.entity.Activity;
import com.momentum.backend.entity.Group;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.ActivityType;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.mapper.ActivityMapper;
import com.momentum.backend.repository.ActivityRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@Slf4j
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository activityRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final ActivityMapper activityMapper;

    public ActivityServiceImpl(
            ActivityRepository activityRepository,
            UserRepository userRepository,
            GroupRepository groupRepository,
            SimpMessagingTemplate messagingTemplate,
            ActivityMapper activityMapper
    ) {
        this.activityRepository = activityRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.messagingTemplate = messagingTemplate;
        this.activityMapper = activityMapper;
    }

    @Override
    @Transactional
    public ActivityResponse recordActivity(UUID userId, UUID groupId, ActivityType type, String description, String metadata) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Group group = null;
        if (groupId != null) {
            group = groupRepository.findById(groupId)
                    .orElse(null);
        }

        Activity activity = Activity.builder()
                .user(user)
                .group(group)
                .type(type)
                .description(description)
                .metadata(metadata)
                .build();

        Activity saved = activityRepository.save(activity);
        ActivityResponse response = activityMapper.toResponse(saved);

        if (groupId != null) {
            String destination = "/topic/group/" + groupId + "/activity";
            messagingTemplate.convertAndSend(destination, response);
            log.info("Broadcasted activity type {} to group {}", type, groupId);
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ActivityResponse> getGroupActivity(UUID groupId, Pageable pageable) {
        return activityRepository.findByGroupIdOrderByCreatedAtDesc(groupId, pageable)
                .map(activityMapper::toResponse);
    }
}
