package com.momentum.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class StreakMilestoneEvent extends ApplicationEvent {
    private final UUID userId;
    private final int streakDays;

    public StreakMilestoneEvent(Object source, UUID userId, int streakDays) {
        super(source);
        this.userId = userId;
        this.streakDays = streakDays;
    }
}
