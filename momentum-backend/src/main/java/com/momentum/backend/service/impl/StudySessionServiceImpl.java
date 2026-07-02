package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.StudySessionStartRequest;
import com.momentum.backend.dto.response.StudySessionResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.SessionStatus;
import com.momentum.backend.event.StudySessionEndedEvent;
import com.momentum.backend.exception.ConflictException;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.mapper.StudySessionMapper;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.StudySessionRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.repository.UserStatsRepository;
import com.momentum.backend.service.StudySessionService;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
public class StudySessionServiceImpl implements StudySessionService {

    private final StudySessionRepository studySessionRepository;
    private final UserRepository userRepository;
    private final GroupRepository groupRepository;
    private final UserStatsRepository userStatsRepository;
    private final StudySessionMapper studySessionMapper;
    private final ApplicationEventPublisher eventPublisher;

    public StudySessionServiceImpl(
            StudySessionRepository studySessionRepository,
            UserRepository userRepository,
            GroupRepository groupRepository,
            UserStatsRepository userStatsRepository,
            StudySessionMapper studySessionMapper,
            ApplicationEventPublisher eventPublisher
    ) {
        this.studySessionRepository = studySessionRepository;
        this.userRepository = userRepository;
        this.groupRepository = groupRepository;
        this.userStatsRepository = userStatsRepository;
        this.studySessionMapper = studySessionMapper;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional
    public StudySessionResponse startSession(String username, StudySessionStartRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Prevent overlapping active sessions per user
        List<StudySession> activeSessions = studySessionRepository.findByUser_IdAndStatus(user.getId(), SessionStatus.ACTIVE);
        if (!activeSessions.isEmpty()) {
            throw new ConflictException("User already has an active study session");
        }

        Group group = null;
        if (request.getGroupId() != null) {
            group = groupRepository.findById(request.getGroupId())
                    .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + request.getGroupId()));
        }

        StudySession session = StudySession.builder()
                .user(user)
                .group(group)
                .subject(request.getSubject())
                .goal(request.getGoal())
                .startTime(OffsetDateTime.now())
                .status(SessionStatus.ACTIVE)
                .build();

        StudySession saved = studySessionRepository.save(session);
        return studySessionMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public StudySessionResponse endSession(UUID sessionId, String username) {
        StudySession session = studySessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Study session not found with ID: " + sessionId));

        if (!session.getUser().getUsername().equals(username)) {
            throw new ConflictException("You do not own this study session");
        }

        if (session.getStatus() != SessionStatus.ACTIVE) {
            return studySessionMapper.toResponse(session); // Already completed or abandoned
        }

        session.setEndTime(OffsetDateTime.now());
        session.setStatus(SessionStatus.COMPLETED);

        // Compute durationMinutes
        int durationMinutes = (int) ChronoUnit.MINUTES.between(session.getStartTime(), session.getEndTime());
        if (durationMinutes < 1) {
            durationMinutes = 1; // Default to 1 minute to avoid zero calculations
        }
        session.setDurationMinutes(durationMinutes);

        StudySession saved = studySessionRepository.save(session);

        // Update UserStats.studyHours
        User user = session.getUser();
        UserStats stats = user.getStats();
        if (stats != null) {
            double hoursEarned = durationMinutes / 60.0;
            stats.setStudyHours(stats.getStudyHours() + hoursEarned);
            userStatsRepository.save(stats);
        }

        // Publish session end domain event
        eventPublisher.publishEvent(new StudySessionEndedEvent(this, saved.getId(), user.getId(), durationMinutes));

        return studySessionMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public StudySessionResponse getActiveSession(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        List<StudySession> activeSessions = studySessionRepository.findByUser_IdAndStatus(user.getId(), SessionStatus.ACTIVE);
        if (activeSessions.isEmpty()) {
            return null; // Return null so controller can map to 204 No Content
        }

        return studySessionMapper.toResponse(activeSessions.get(0));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<StudySessionResponse> getSessionHistory(
            String username,
            OffsetDateTime startDate,
            OffsetDateTime endDate,
            String subject,
            Pageable pageable
    ) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Page<StudySession> sessions = studySessionRepository.findHistory(user.getId(), startDate, endDate, subject, pageable);
        return sessions.map(studySessionMapper::toResponse);
    }
}
