package com.momentum.backend.service;

import com.momentum.backend.dto.request.StudySessionStartRequest;
import com.momentum.backend.dto.response.StudySessionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.OffsetDateTime;
import java.util.UUID;

public interface StudySessionService {
    StudySessionResponse startSession(String username, StudySessionStartRequest request);
    StudySessionResponse endSession(UUID sessionId, String username);
    StudySessionResponse getActiveSession(String username);
    Page<StudySessionResponse> getSessionHistory(
            String username,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            String subject,
            Pageable pageable
    );
}
