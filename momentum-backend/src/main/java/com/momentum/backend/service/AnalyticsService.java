package com.momentum.backend.service;

import com.momentum.backend.dto.response.AnalyticsChartResponse;

import java.util.UUID;

public interface AnalyticsService {
    AnalyticsChartResponse getWeeklyHours(String username);
    AnalyticsChartResponse getMonthlyProgress(String username);
    AnalyticsChartResponse getCategoryDistribution(String username);
    AnalyticsChartResponse getMostActiveMember(UUID groupId);
    AnalyticsChartResponse getProductiveHours(UUID groupId);
}
