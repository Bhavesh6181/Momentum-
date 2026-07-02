package com.momentum.backend.event;

import com.momentum.backend.enums.ActivityType;
import com.momentum.backend.service.ActivityService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class ActivityEventListener {

    private final ActivityService activityService;

    public ActivityEventListener(ActivityService activityService) {
        this.activityService = activityService;
    }

    @EventListener
    public void handleStudySessionStarted(StudySessionStartedEvent event) {
        log.info("Handling StudySessionStartedEvent for session: {}", event.getSessionId());
        String description = "started a study session focusing on " + event.getSubject();
        String metadata = String.format("{\"sessionId\":\"%s\",\"subject\":\"%s\"}", event.getSessionId(), event.getSubject());
        activityService.recordActivity(
                event.getUserId(),
                event.getGroupId(),
                ActivityType.SESSION_STARTED,
                description,
                metadata
        );
    }

    @EventListener
    public void handleStudySessionEnded(StudySessionEndedEvent event) {
        log.info("Handling StudySessionEndedEvent for session: {}", event.getStudySessionId());
        String description = "completed a study session of " + event.getDurationMinutes() + " minutes";
        String metadata = String.format("{\"sessionId\":\"%s\",\"durationMinutes\":%d}", event.getStudySessionId(), event.getDurationMinutes());
        activityService.recordActivity(
                event.getUserId(),
                event.getGroupId(),
                ActivityType.SESSION_COMPLETED,
                description,
                metadata
        );
    }

    @EventListener
    public void handleGoalCompleted(GoalCompletedEvent event) {
        log.info("Handling GoalCompletedEvent for goal: {}", event.getGoalId());
        String description = "completed the goal: " + event.getTitle();
        String metadata = String.format("{\"goalId\":\"%s\",\"title\":\"%s\"}", event.getGoalId(), event.getTitle());
        activityService.recordActivity(
                event.getUserId(),
                event.getGroupId(),
                ActivityType.GOAL_COMPLETED,
                description,
                metadata
        );
    }
}
