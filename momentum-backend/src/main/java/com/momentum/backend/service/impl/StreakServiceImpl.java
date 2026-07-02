package com.momentum.backend.service.impl;

import com.momentum.backend.config.StreakProperties;
import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.event.StreakMilestoneEvent;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.UserStatsRepository;
import com.momentum.backend.service.LeaderboardService;
import com.momentum.backend.service.StreakService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class StreakServiceImpl implements StreakService {

    private static final String STUDY_MINUTES_KEY_PREFIX = "user:streak:study-minutes:";
    private static final String GOALS_KEY_PREFIX = "user:streak:goals:";

    private final StringRedisTemplate redisTemplate;
    private final UserStatsRepository userStatsRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final LeaderboardService leaderboardService;
    private final StreakProperties streakProperties;
    private final ApplicationEventPublisher eventPublisher;
    private final Clock clock;

    public StreakServiceImpl(
            StringRedisTemplate redisTemplate,
            UserStatsRepository userStatsRepository,
            GroupMemberRepository groupMemberRepository,
            LeaderboardService leaderboardService,
            StreakProperties streakProperties,
            ApplicationEventPublisher eventPublisher,
            Clock clock
    ) {
        this.redisTemplate = redisTemplate;
        this.userStatsRepository = userStatsRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.leaderboardService = leaderboardService;
        this.streakProperties = streakProperties;
        this.eventPublisher = eventPublisher;
        this.clock = clock;
    }

    @Override
    public void recordDailyStudyMinutes(UUID userId, int durationMinutes) {
        String dateStr = LocalDate.now(clock).toString();
        String key = STUDY_MINUTES_KEY_PREFIX + userId + ":" + dateStr;
        redisTemplate.opsForValue().increment(key, durationMinutes);
        redisTemplate.expire(key, 7, TimeUnit.DAYS);
        log.debug("Recorded {} study minutes for user {} on {}", durationMinutes, userId, dateStr);
    }

    @Override
    public void recordDailyGoalCompleted(UUID userId) {
        String dateStr = LocalDate.now(clock).toString();
        String key = GOALS_KEY_PREFIX + userId + ":" + dateStr;
        redisTemplate.opsForValue().increment(key, 1);
        redisTemplate.expire(key, 7, TimeUnit.DAYS);
        log.debug("Recorded goal completion for user {} on {}", userId, dateStr);
    }

    @Override
    @Scheduled(cron = "0 1 0 * * *") // Runs at 00:01 every day
    @Transactional
    public void evaluateNightlyStreaks() {
        LocalDate yesterday = LocalDate.now(clock).minusDays(1);
        String yesterdayStr = yesterday.toString();
        log.info("Starting nightly streak evaluation for date: {}", yesterdayStr);

        List<UserStats> allStats = userStatsRepository.findAllWithUser();
        int minStudyMinutes = streakProperties.getMinStudyMinutes();

        int processed = 0;
        int updated = 0;

        for (UserStats stats : allStats) {
            UUID userId = stats.getUser().getId();
            processed++;

            String studyKey = STUDY_MINUTES_KEY_PREFIX + userId + ":" + yesterdayStr;
            String goalsKey = GOALS_KEY_PREFIX + userId + ":" + yesterdayStr;

            String studyVal = redisTemplate.opsForValue().get(studyKey);
            String goalsVal = redisTemplate.opsForValue().get(goalsKey);

            int studyMinutes = studyVal != null ? Integer.parseInt(studyVal) : 0;
            int goalsCompleted = goalsVal != null ? Integer.parseInt(goalsVal) : 0;

            boolean metThreshold = (studyMinutes >= minStudyMinutes) || (goalsCompleted > 0);

            int oldStreak = stats.getCurrentStreak();
            int newStreak = metThreshold ? oldStreak + 1 : 0;

            // Database optimization: Only save if state changed
            if (newStreak != oldStreak) {
                updated++;
                stats.setCurrentStreak(newStreak);
                if (newStreak > stats.getLongestStreak()) {
                    stats.setLongestStreak(newStreak);
                }
                userStatsRepository.save(stats);

                // Update global streak leaderboard score
                leaderboardService.updateScore(userId, null, "streak", newStreak);

                // Update group-scoped streak leaderboard scores
                List<GroupMember> memberships = groupMemberRepository.findByUserId(userId);
                for (GroupMember membership : memberships) {
                    if (membership.getStatus() == GroupMembershipStatus.ACTIVE) {
                        leaderboardService.updateScore(userId, membership.getGroup().getId(), "streak", newStreak);
                    }
                }

                // Publish milestone event if streak reaches 7, 30, or 100 days
                if (newStreak == 7 || newStreak == 30 || newStreak == 100) {
                    eventPublisher.publishEvent(new StreakMilestoneEvent(this, userId, newStreak));
                    log.info("Milestone streak reached! Published StreakMilestoneEvent for user {} (streak: {})", userId, newStreak);
                }
            }
        }

        log.info("Nightly streak evaluation finished. Processed {} users, updated stats for {} users.", processed, updated);
    }
}
