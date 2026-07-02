package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.PomodoroStartRequest;
import com.momentum.backend.dto.response.PomodoroSessionResponse;
import com.momentum.backend.entity.PomodoroSession;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.PomodoroMode;
import com.momentum.backend.exception.ConflictException;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.mapper.PomodoroSessionMapper;
import com.momentum.backend.repository.PomodoroSessionRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.PomodoroService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
public class PomodoroServiceImpl implements PomodoroService {

    private final PomodoroSessionRepository pomodoroSessionRepository;
    private final UserRepository userRepository;
    private final PomodoroSessionMapper pomodoroSessionMapper;

    public PomodoroServiceImpl(
            PomodoroSessionRepository pomodoroSessionRepository,
            UserRepository userRepository,
            PomodoroSessionMapper pomodoroSessionMapper
    ) {
        this.pomodoroSessionRepository = pomodoroSessionRepository;
        this.userRepository = userRepository;
        this.pomodoroSessionMapper = pomodoroSessionMapper;
    }

    @Override
    @Transactional
    public PomodoroSessionResponse startSession(String username, PomodoroStartRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Prevent overlapping active pomodoro sessions
        pomodoroSessionRepository.findActiveSessionByUserId(user.getId())
                .ifPresent(s -> {
                    throw new ConflictException("User already has an active Pomodoro session");
                });

        PomodoroMode mode = PomodoroMode.fromValue(request.getMode());
        int work = 25;
        int rest = 5;

        if (mode == PomodoroMode.FOCUS_50_10) {
            work = 50;
            rest = 10;
        } else if (mode == PomodoroMode.CUSTOM) {
            if (request.getWorkMinutes() == null || request.getWorkMinutes() <= 0 ||
                request.getBreakMinutes() == null || request.getBreakMinutes() <= 0) {
                throw new ValidationException("Work and break minutes must be positive values for custom mode");
            }
            work = request.getWorkMinutes();
            rest = request.getBreakMinutes();
        }

        PomodoroSession session = PomodoroSession.builder()
                .user(user)
                .mode(mode)
                .workMinutes(work)
                .breakMinutes(rest)
                .startedAt(OffsetDateTime.now())
                .cyclesCompleted(0)
                .build();

        PomodoroSession saved = pomodoroSessionRepository.save(session);
        return pomodoroSessionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PomodoroSessionResponse completeCycle(UUID sessionId, String username) {
        PomodoroSession session = pomodoroSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Pomodoro session not found with ID: " + sessionId));

        if (!session.getUser().getUsername().equals(username)) {
            throw new ConflictException("You do not own this Pomodoro session");
        }

        if (session.getCompletedAt() != null) {
            throw new ConflictException("Cannot complete cycle on an already ended Pomodoro session");
        }

        session.setCyclesCompleted(session.getCyclesCompleted() + 1);
        PomodoroSession saved = pomodoroSessionRepository.save(session);
        return pomodoroSessionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public PomodoroSessionResponse endSession(UUID sessionId, String username) {
        PomodoroSession session = pomodoroSessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Pomodoro session not found with ID: " + sessionId));

        if (!session.getUser().getUsername().equals(username)) {
            throw new ConflictException("You do not own this Pomodoro session");
        }

        if (session.getCompletedAt() != null) {
            return pomodoroSessionMapper.toResponse(session); // Already completed
        }

        session.setCompletedAt(OffsetDateTime.now());
        PomodoroSession saved = pomodoroSessionRepository.save(session);
        return pomodoroSessionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PomodoroSessionResponse> getSessionHistory(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Page<PomodoroSession> sessions = pomodoroSessionRepository.findByUserId(user.getId(), pageable);
        return sessions.map(pomodoroSessionMapper::toResponse);
    }
}
