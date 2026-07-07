package com.momentum.backend.service;

import com.momentum.backend.dto.request.GoalCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.dto.response.GoalResponse;
import com.momentum.backend.enums.GoalStatus;
import com.momentum.backend.enums.GoalType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GoalService {
    GoalResponse createGoal(String username, GoalCreateRequest request);
    GoalResponse updateProgress(UUID goalId, String username, GoalProgressRequest request);
    Page<GoalResponse> getMyGoals(String username, GoalType type, GoalStatus status, Pageable pageable);
    Page<GoalResponse> getGroupGoals(UUID groupId, Pageable pageable);
}
