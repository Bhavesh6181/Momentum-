package com.momentum.backend.event;

import com.momentum.backend.enums.ActivityType;
import com.momentum.backend.enums.LeaderboardType;
import com.momentum.backend.service.ActivityService;
import com.momentum.backend.service.StreakService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
public class ActivityEventListener {

    private final ActivityService activityService;
    private final StreakService streakService;
    private final ApplicationEventPublisher eventPublisher;

    public ActivityEventListener(
            ActivityService activityService,
            StreakService streakService,
            ApplicationEventPublisher eventPublisher
    ) {
        this.activityService = activityService;
        this.streakService = streakService;
        this.eventPublisher = eventPublisher;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
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

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStudySessionEnded(StudySessionEndedEvent event) {
        log.info("Handling StudySessionEndedEvent for session: {}", event.getStudySessionId());
        String description = "completed a study session of " + event.getDurationMinutes() + " minutes";
        String metadata = String.format("{\"sessionId\":\"%s\",\"durationMinutes\":%d}", event.getStudySessionId(), event.getDurationMinutes());
        
        // Record activity log
        activityService.recordActivity(
                event.getUserId(),
                event.getGroupId(),
                ActivityType.SESSION_COMPLETED,
                description,
                metadata
        );

        // Record streak qualifying minutes
        streakService.recordDailyStudyMinutes(event.getUserId(), event.getDurationMinutes());

        // Publish leaderboard score update event
        eventPublisher.publishEvent(new LeaderboardUpdatedEvent(
                this,
                event.getUserId(),
                event.getGroupId(),
                LeaderboardType.STUDY_HOURS,
                event.getDurationMinutes() / 60.0
        ));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleGoalCompleted(GoalCompletedEvent event) {
        log.info("Handling GoalCompletedEvent for goal: {}", event.getGoalId());
        String description = "completed the goal: " + event.getTitle();
        String metadata = String.format("{\"goalId\":\"%s\",\"title\":\"%s\"}", event.getGoalId(), event.getTitle());
        
        // Record activity log
        activityService.recordActivity(
                event.getUserId(),
                event.getGroupId(),
                ActivityType.GOAL_COMPLETED,
                description,
                metadata
        );

        // Record streak qualifying goal completion
        streakService.recordDailyGoalCompleted(event.getUserId());

        // Publish leaderboard score update event
        eventPublisher.publishEvent(new LeaderboardUpdatedEvent(
                this,
                event.getUserId(),
                event.getGroupId(),
                LeaderboardType.TASKS_COMPLETED,
                1.0
        ));
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handleStreakMilestone(StreakMilestoneEvent event) {
        log.info("Handling StreakMilestoneEvent for user: {}, streak: {}", event.getUserId(), event.getStreakDays());
        String description = "hit a study streak milestone of " + event.getStreakDays() + " days! 🔥";
        String metadata = String.format("{\"streakDays\":%d}", event.getStreakDays());
        
        // Record milestone activity (scope globally)
        activityService.recordActivity(
                event.getUserId(),
                null,
                ActivityType.STREAK_MILESTONE,
                description,
                metadata
        );
    }
}
