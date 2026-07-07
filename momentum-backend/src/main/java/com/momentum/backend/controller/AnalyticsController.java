package com.momentum.backend.controller;

import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.AnalyticsChartResponse;
import com.momentum.backend.service.AnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/analytics")
@Slf4j
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/me/weekly-hours")
    public ResponseEntity<ApiResponse<AnalyticsChartResponse>> getWeeklyHours(Principal principal) {
        log.info("Fetching weekly hours for: {}", principal.getName());
        AnalyticsChartResponse response = analyticsService.getWeeklyHours(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Weekly study hours retrieved"));
    }

    @GetMapping("/me/monthly-progress")
    public ResponseEntity<ApiResponse<AnalyticsChartResponse>> getMonthlyProgress(Principal principal) {
        log.info("Fetching monthly progress for: {}", principal.getName());
        AnalyticsChartResponse response = analyticsService.getMonthlyProgress(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Monthly progress retrieved"));
    }

    @GetMapping("/me/category-distribution")
    public ResponseEntity<ApiResponse<AnalyticsChartResponse>> getCategoryDistribution(Principal principal) {
        log.info("Fetching category distribution for: {}", principal.getName());
        AnalyticsChartResponse response = analyticsService.getCategoryDistribution(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Category distribution retrieved"));
    }

    @GetMapping("/groups/{groupId}/most-active")
    public ResponseEntity<ApiResponse<AnalyticsChartResponse>> getMostActiveMember(
            @PathVariable UUID groupId
    ) {
        log.info("Fetching most active member for group: {}", groupId);
        AnalyticsChartResponse response = analyticsService.getMostActiveMember(groupId);
        return ResponseEntity.ok(ApiResponse.success(response, "Most active member retrieved"));
    }

    @GetMapping("/groups/{groupId}/productive-hours")
    public ResponseEntity<ApiResponse<AnalyticsChartResponse>> getProductiveHours(
            @PathVariable UUID groupId
    ) {
        log.info("Fetching productive hours histogram for group: {}", groupId);
        AnalyticsChartResponse response = analyticsService.getProductiveHours(groupId);
        return ResponseEntity.ok(ApiResponse.success(response, "Productive hours retrieved"));
    }
}
