package com.momentum.backend.repository;

import com.momentum.backend.entity.StudySession;
import com.momentum.backend.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, Long> {
    List<StudySession> findByUserId(Long userId);
    List<StudySession> findByGroupId(Long groupId);
    List<StudySession> findByUserIdAndStatus(Long userId, SessionStatus status);
}
