package com.momentum.backend.repository;

import com.momentum.backend.entity.PomodoroSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {

    @Query("SELECT p FROM PomodoroSession p WHERE p.user.id = :userId AND p.completedAt IS NULL")
    Optional<PomodoroSession> findActiveSessionByUserId(@Param("userId") UUID userId);

    Page<PomodoroSession> findByUserId(UUID userId, Pageable pageable);
}
