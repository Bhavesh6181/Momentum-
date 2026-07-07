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

    @Query("SELECT CAST(s.startTime AS date) as date, SUM(s.durationMinutes) / 60.0 as hours " +
           "FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.startTime >= :since AND s.status = com.momentum.backend.enums.SessionStatus.COMPLETED " +
           "GROUP BY CAST(s.startTime AS date) " +
           "ORDER BY CAST(s.startTime AS date) ASC")
    List<Object[]> findWeeklyHoursGroupedByDate(@Param("userId") UUID userId, @Param("since") OffsetDateTime since);

    @Query("SELECT s.subject, SUM(s.durationMinutes) / 60.0 " +
           "FROM StudySession s " +
           "WHERE s.user.id = :userId AND s.status = com.momentum.backend.enums.SessionStatus.COMPLETED " +
           "GROUP BY s.subject " +
           "ORDER BY SUM(s.durationMinutes) DESC")
    List<Object[]> findHoursGroupedBySubject(@Param("userId") UUID userId);

    @Query("SELECT s.user.id, s.user.username, SUM(s.durationMinutes) / 60.0 " +
           "FROM StudySession s " +
           "WHERE s.group.id = :groupId AND s.startTime >= :since AND s.status = com.momentum.backend.enums.SessionStatus.COMPLETED " +
           "GROUP BY s.user.id, s.user.username " +
           "ORDER BY SUM(s.durationMinutes) DESC")
    List<Object[]> findMostActiveGroupMember(@Param("groupId") UUID groupId, @Param("since") OffsetDateTime since);

    @Query("SELECT EXTRACT(HOUR FROM s.startTime) as hour, COUNT(s) as sessionCount " +
           "FROM StudySession s " +
           "WHERE s.group.id = :groupId AND s.status = com.momentum.backend.enums.SessionStatus.COMPLETED " +
           "GROUP BY EXTRACT(HOUR FROM s.startTime) " +
           "ORDER BY EXTRACT(HOUR FROM s.startTime) ASC")
    List<Object[]> findProductiveHours(@Param("groupId") UUID groupId);
}
