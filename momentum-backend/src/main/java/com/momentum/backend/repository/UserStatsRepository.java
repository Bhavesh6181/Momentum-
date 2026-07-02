package com.momentum.backend.repository;

import com.momentum.backend.entity.UserStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserStatsRepository extends JpaRepository<UserStats, Long> {
    Optional<UserStats> findByUserId(Long userId);
    List<UserStats> findByOrderByStudyHoursDesc();
    List<UserStats> findByOrderByDsaProblemsSolvedDesc();
}
