package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserStatsResponse {
    private double studyHours;
    private int totalTasksCompleted;
    private int dsaProblemsSolved;
    private int currentStreak;
    private int longestStreak;
    private double weeklyHours;
    private double monthlyHours;
}
