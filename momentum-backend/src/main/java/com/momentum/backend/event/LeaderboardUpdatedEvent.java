package com.momentum.backend.event;

import com.momentum.backend.enums.LeaderboardType;
import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class LeaderboardUpdatedEvent extends ApplicationEvent {
    private final UUID userId;
    private final UUID groupId;
    private final LeaderboardType type;
    private final double scoreDelta;

    public LeaderboardUpdatedEvent(Object source, UUID userId, UUID groupId, LeaderboardType type, double scoreDelta) {
        super(source);
        this.userId = userId;
        this.groupId = groupId;
        this.type = type;
        this.scoreDelta = scoreDelta;
    }
}
