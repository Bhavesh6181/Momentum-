package com.momentum.backend.repository;

import com.momentum.backend.entity.StudySession;
import com.momentum.backend.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {
    List<StudySession> findByUserId(UUID userId);
    List<StudySession> findByGroupId(UUID groupId);
    List<StudySession> findByUserIdAndStatus(UUID userId, SessionStatus status);
}
