package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.GoalCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.dto.response.GoalResponse;
import com.momentum.backend.entity.Goal;
import com.momentum.backend.entity.Group;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.GoalStatus;
import com.momentum.backend.enums.GoalType;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.mapper.GoalMapper;
import com.momentum.backend.repository.GoalRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.GoalService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GoalServiceImpl implements GoalService {

    private final GoalRepository goalRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final GoalMapper goalMapper;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public GoalServiceImpl(
            GoalRepository goalRepository,
            UserRepository userRepository,
            GroupRepository groupRepository,
            GoalMapper goalMapper,
            org.springframework.context.ApplicationEventPublisher eventPublisher
    ) {
        this.goalRepository = goalRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.goalMapper = goalMapper;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public GoalResponse createGoal(String username, GoalCreateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("End date must be after or equal to start date");
        }

        Group group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + request.getGroupId()));
        }

        Goal goal = Goal.builder()
                .user(user)
                .group(group)
                .type(request.getType())
                .title(request.getTitle())
                .targetValue(request.getTargetValue())
                .currentValue(0.0)
                .unit(request.getUnit())
                .status(GoalStatus.IN_PROGRESS)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        return goalMapper.toResponse(goalRepository.save(goal));
    }

    @Override
    @Transactional
    public GoalResponse updateProgress(UUID goalId, String username, GoalProgressRequest request) {
        Goal goal = goalRepository.findById(goalId)
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found: " + goalId));

        if (!goal.getUser().getUsername().equals(username)) {
            throw new AccessDeniedException("You do not own this goal");
        }

        if (goal.getStatus() == GoalStatus.FAILED) {
            throw new ValidationException("Cannot update progress on a failed goal");
        }
        if (goal.getStatus() == GoalStatus.COMPLETED) {
            // Already completed — return current state idempotently
            return goalMapper.toResponse(goal);
        }

        // Absolute set (not delta — simpler for manual updates)
        goal.setCurrentValue(request.getValue());

        // Auto-complete when target is reached
        boolean completedNow = false;
        if (goal.getCurrentValue() >= goal.getTargetValue()) {
            goal.setStatus(GoalStatus.COMPLETED);
            completedNow = true;
        }

        Goal saved = goalRepository.save(goal);

        if (completedNow) {
            eventPublisher.publishEvent(new com.momentum.backend.event.GoalCompletedEvent(
                    this,
                    saved.getUser().getId(),
                    saved.getId(),
                    saved.getTitle(),
                    saved.getGroup() != null ? saved.getGroup().getId() : null
            ));
        }

        return goalMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalResponse> getMyGoals(String username, GoalType type, GoalStatus status, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        return goalRepository.findMyGoals(user.getId(), type, status, pageable)
                .map(goalMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GoalResponse> getGroupGoals(UUID groupId, Pageable pageable) {
        groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));

        return goalRepository.findByGroupId(groupId, pageable)
                .map(goalMapper::toResponse);
    }
}
