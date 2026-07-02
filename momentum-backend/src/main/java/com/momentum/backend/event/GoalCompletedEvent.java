package com.momentum.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class GoalCompletedEvent extends ApplicationEvent {
    private final UUID userId;
    private final UUID goalId;
    private final String title;
    private final UUID groupId;

    public GoalCompletedEvent(Object source, UUID userId, UUID goalId, String title, UUID groupId) {
        super(source);
        this.userId = userId;
        this.goalId = goalId;
        this.title = title;
        this.groupId = groupId;
    }
}
