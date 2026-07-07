package com.momentum.backend.scheduler;

import com.momentum.backend.repository.ChallengeRepository;
import com.momentum.backend.repository.GoalRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

/**
 * Nightly scheduler that expires overdue goals and closes ended challenges.
 * Cron is externalized to application config to allow environment-specific overrides.
 */
@Component
@Slf4j
public class GoalChallengeScheduler {

    private final GoalRepository goalRepository;
    private final ChallengeRepository challengeRepository;

    public GoalChallengeScheduler(
            GoalRepository goalRepository,
            ChallengeRepository challengeRepository
    ) {
        this.goalRepository = goalRepository;
        this.challengeRepository = challengeRepository;
    }

    @Scheduled(cron = "${app.scheduler.goal-expiry-cron:0 0 0 * * *}")
    @Transactional
    public void markExpiredGoals() {
        LocalDate today = LocalDate.now();
        log.info("Running nightly goal expiry job for date: {}", today);
        int updated = goalRepository.markExpiredGoalsFailed(today);
        log.info("Marked {} IN_PROGRESS goals as FAILED (end date < {})", updated, today);
    }

    @Scheduled(cron = "${app.scheduler.challenge-expiry-cron:0 0 0 * * *}")
    @Transactional
    public void closeExpiredChallenges() {
        LocalDate today = LocalDate.now();
        log.info("Running nightly challenge close job for date: {}", today);
        int updated = challengeRepository.closeExpiredChallenges(today);
        log.info("Closed {} OPEN challenges (end date < {})", updated, today);
    }
}
