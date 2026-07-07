package com.momentum.backend.event;

import lombok.Getter;
import java.util.UUID;

@Getter
public class GroupJoinedEvent {
    private final UUID userId;
    private final UUID groupId;
    private final String groupName;

    public GroupJoinedEvent(UUID userId, UUID groupId, String groupName) {
        this.userId = userId;
        this.groupId = groupId;
        this.groupName = groupName;
    }
}
