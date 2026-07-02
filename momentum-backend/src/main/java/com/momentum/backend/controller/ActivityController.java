package com.momentum.backend.controller;

import com.momentum.backend.dto.response.ActivityResponse;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.service.ActivityService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/activity")
public class ActivityController {

    private final ActivityService activityService;

    public ActivityController(ActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<ActivityResponse>>> getGroupActivity(
            @PathVariable UUID groupId,
            Pageable pageable
    ) {
        Page<ActivityResponse> history = activityService.getGroupActivity(groupId, pageable);
        return ResponseEntity.ok(ApiResponse.success(history, "Group activity feed retrieved successfully"));
    }
}
