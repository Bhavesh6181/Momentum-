package com.momentum.backend.event;

import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.NotificationType;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

import java.util.List;

@Component
@Slf4j
public class NotificationEventListener {

    private final NotificationService notificationService;
    private final GroupMemberRepository groupMemberRepository;

    public NotificationEventListener(
            NotificationService notificationService,
            GroupMemberRepository groupMemberRepository
    ) {
        this.notificationService = notificationService;
        this.groupMemberRepository = groupMemberRepository;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleGoalCompleted(GoalCompletedEvent event) {
        log.info("Handling GoalCompletedEvent for goal: {}", event.getGoalId());
        String message = String.format("Congratulations! You completed your goal: %s", event.getTitle());
        String metadata = String.format("{\"goalId\":\"%s\",\"goalTitle\":\"%s\"}", event.getGoalId(), event.getTitle());
        notificationService.createNotification(event.getUserId(), NotificationType.GOAL_COMPLETED, message, metadata);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleStreakMilestone(StreakMilestoneEvent event) {
        log.info("Handling StreakMilestoneEvent for user: {}, days: {}", event.getUserId(), event.getStreakDays());
        String message = String.format("Awesome! You've reached a %d-day streak milestone!", event.getStreakDays());
        String metadata = String.format("{\"streakDays\":%d}", event.getStreakDays());
        notificationService.createNotification(event.getUserId(), NotificationType.MILESTONE_REACHED, message, metadata);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleGroupJoined(GroupJoinedEvent event) {
        log.info("Handling GroupJoinedEvent for user: {}, group: {}", event.getUserId(), event.getGroupId());
        String message = String.format("You have joined the group %s.", event.getGroupName());
        String metadata = String.format("{\"groupId\":\"%s\",\"groupName\":\"%s\"}", event.getGroupId(), event.getGroupName());
        notificationService.createNotification(event.getUserId(), NotificationType.GROUP_JOINED, message, metadata);
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleChallengeCreated(ChallengeCreatedEvent event) {
        log.info("Handling ChallengeCreatedEvent for challenge: {}, group: {}", event.getChallengeId(), event.getGroupId());
        String message = String.format("A new challenge has been posted in %s: %s", event.getGroupName(), event.getChallengeTitle());
        String metadata = String.format("{\"challengeId\":\"%s\",\"groupId\":\"%s\",\"challengeTitle\":\"%s\",\"groupName\":\"%s\"}",
                event.getChallengeId(), event.getGroupId(), event.getChallengeTitle(), event.getGroupName());

        List<GroupMember> members = groupMemberRepository.findByGroupIdAndStatus(event.getGroupId(), GroupMembershipStatus.ACTIVE);
        for (GroupMember member : members) {
            notificationService.createNotification(member.getUser().getId(), NotificationType.CHALLENGED, message, metadata);
        }
    }
}
