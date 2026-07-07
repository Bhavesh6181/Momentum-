package com.momentum.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class StudySessionEndedEvent extends ApplicationEvent {

    private final UUID studySessionId;
    private final UUID userId;
    private final int durationMinutes;
    private final UUID groupId;

    public StudySessionEndedEvent(Object source, UUID studySessionId, UUID userId, int durationMinutes, UUID groupId) {
        super(source);
        this.studySessionId = studySessionId;
        this.userId = userId;
        this.durationMinutes = durationMinutes;
        this.groupId = groupId;
    }
}
