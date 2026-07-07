package com.momentum.backend.repository;

import com.momentum.backend.entity.Goal;
import com.momentum.backend.enums.GoalStatus;
import com.momentum.backend.enums.GoalType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface GoalRepository extends JpaRepository<Goal, UUID> {

    @Query("SELECT g FROM Goal g WHERE g.user.id = :userId " +
           "AND (:type IS NULL OR g.type = :type) " +
           "AND (:status IS NULL OR g.status = :status)")
    Page<Goal> findMyGoals(
            @Param("userId") UUID userId,
            @Param("type") GoalType type,
            @Param("status") GoalStatus status,
            Pageable pageable
    );

    @Query("SELECT g FROM Goal g WHERE g.group.id = :groupId")
    Page<Goal> findByGroupId(@Param("groupId") UUID groupId, Pageable pageable);

    /** Used by the nightly scheduler to expire goals */
    @Modifying
    @Query("UPDATE Goal g SET g.status = 'FAILED' " +
           "WHERE g.status = 'IN_PROGRESS' AND g.endDate < :today")
    int markExpiredGoalsFailed(@Param("today") LocalDate today);
}
