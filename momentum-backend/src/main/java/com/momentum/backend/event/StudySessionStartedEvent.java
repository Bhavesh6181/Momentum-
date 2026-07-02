package com.momentum.backend.event;

import lombok.Getter;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

@Getter
public class StudySessionStartedEvent extends ApplicationEvent {
    private final UUID userId;
    private final UUID sessionId;
    private final String subject;
    private final UUID groupId;

    public StudySessionStartedEvent(Object source, UUID userId, UUID sessionId, String subject, UUID groupId) {
        super(source);
        this.userId = userId;
        this.sessionId = sessionId;
        this.subject = subject;
        this.groupId = groupId;
    }
}
