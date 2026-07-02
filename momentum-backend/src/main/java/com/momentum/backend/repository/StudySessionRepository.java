package com.momentum.backend.repository;

import com.momentum.backend.entity.StudySession;
import com.momentum.backend.enums.SessionStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface StudySessionRepository extends JpaRepository<StudySession, UUID> {

    List<StudySession> findByUser_Id(UUID userId);

    List<StudySession> findByGroup_Id(UUID groupId);

    List<StudySession> findByUser_IdAndStatus(UUID userId, SessionStatus status);

    @Query("SELECT s FROM StudySession s WHERE s.group.id = :groupId " +
           "AND s.status = :status AND s.startTime > :time")
    List<StudySession> findByGroupIdAndStatusAndStartTimeAfter(
            @Param("groupId") UUID groupId,
            @Param("status") SessionStatus status,
            @Param("time") OffsetDateTime time
    );

    @Query("SELECT s FROM StudySession s WHERE s.user.id = :userId " +
           "AND (:startDate IS NULL OR s.startTime >= :startDate) " +
           "AND (:endDate IS NULL OR s.startTime <= :endDate) " +
           "AND (:subject IS NULL OR LOWER(s.subject) LIKE LOWER(CONCAT('%', :subject, '%')))")
    Page<StudySession> findHistory(
            @Param("userId") UUID userId,
            @Param("startDate") OffsetDateTime startDate,
            @Param("endDate") OffsetDateTime endDate,
            @Param("subject") String subject,
            Pageable pageable
    );
}
