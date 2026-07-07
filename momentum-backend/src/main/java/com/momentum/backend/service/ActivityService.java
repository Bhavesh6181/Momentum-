package com.momentum.backend.service;

import com.momentum.backend.dto.response.ActivityResponse;
import com.momentum.backend.enums.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ActivityService {
    ActivityResponse recordActivity(UUID userId, UUID groupId, ActivityType type, String description, String metadata);
    Page<ActivityResponse> getGroupActivity(UUID groupId, Pageable pageable);
}
