package com.momentum.backend.event;

import lombok.Getter;
import java.util.UUID;

@Getter
public class ChallengeCreatedEvent {
    private final UUID challengeId;
    private final UUID groupId;
    private final String challengeTitle;
    private final String groupName;

    public ChallengeCreatedEvent(UUID challengeId, UUID groupId, String challengeTitle, String groupName) {
        this.challengeId = challengeId;
        this.groupId = groupId;
        this.challengeTitle = challengeTitle;
        this.groupName = groupName;
    }
}
