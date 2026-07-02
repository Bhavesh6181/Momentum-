package com.momentum.backend.controller;

import com.momentum.backend.dto.request.GoalCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.GoalResponse;
import com.momentum.backend.enums.GoalStatus;
import com.momentum.backend.enums.GoalType;
import com.momentum.backend.service.GoalService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/goals")
public class GoalController {

    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GoalResponse>> createGoal(
            @Valid @RequestBody GoalCreateRequest request,
            Principal principal
    ) {
        GoalResponse response = goalService.createGoal(principal.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response, "Goal created successfully"));
    }

    @PutMapping("/{goalId}/progress")
    public ResponseEntity<ApiResponse<GoalResponse>> updateProgress(
            @PathVariable UUID goalId,
            @Valid @RequestBody GoalProgressRequest request,
            Principal principal
    ) {
        GoalResponse response = goalService.updateProgress(goalId, principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Progress updated"));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Page<GoalResponse>>> getMyGoals(
            Principal principal,
            @RequestParam(required = false) GoalType type,
            @RequestParam(required = false) GoalStatus status,
            Pageable pageable
    ) {
        Page<GoalResponse> goals = goalService.getMyGoals(principal.getName(), type, status, pageable);
        return ResponseEntity.ok(ApiResponse.success(goals, "Goals retrieved"));
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<ApiResponse<Page<GoalResponse>>> getGroupGoals(
            @PathVariable UUID groupId,
            Pageable pageable
    ) {
        Page<GoalResponse> goals = goalService.getGroupGoals(groupId, pageable);
        return ResponseEntity.ok(ApiResponse.success(goals, "Group goals retrieved"));
    }
}
