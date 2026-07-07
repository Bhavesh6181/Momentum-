package com.momentum.backend.service;

import com.momentum.backend.dto.request.PomodoroStartRequest;
import com.momentum.backend.dto.response.PomodoroSessionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface PomodoroService {
    PomodoroSessionResponse startSession(String username, PomodoroStartRequest request);
    PomodoroSessionResponse completeCycle(UUID sessionId, String username);
    PomodoroSessionResponse endSession(UUID sessionId, String username);
    Page<PomodoroSessionResponse> getSessionHistory(String username, Pageable pageable);
}
