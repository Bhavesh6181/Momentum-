package com.momentum.backend.repository;

import com.momentum.backend.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, UUID> {
    Optional<UserStats> findByUserId(UUID userId);
    List<UserStats> findByOrderByStudyHoursDesc();
    List<UserStats> findByOrderByDsaProblemsSolvedDesc();

    @Query("SELECT s FROM UserStats s JOIN FETCH s.user")
    List<UserStats> findAllWithUser();
}
