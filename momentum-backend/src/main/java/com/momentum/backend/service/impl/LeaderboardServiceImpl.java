package com.momentum.backend.service.impl;

import com.momentum.backend.dto.response.LeaderboardEntryResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.LeaderboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations.TypedTuple;
import org.springframework.stereotype.Service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class LeaderboardServiceImpl implements LeaderboardService {

    private final StringRedisTemplate redisTemplate;
    private final UserRepository userRepository;
    private final Clock clock;

    public LeaderboardServiceImpl(StringRedisTemplate redisTemplate, UserRepository userRepository, Clock clock) {
        this.redisTemplate = redisTemplate;
        this.userRepository = userRepository;
        this.clock = clock;
    }

    @Override
    public void updateScore(UUID userId, UUID groupId, String type, double increment) {
        LocalDate now = LocalDate.now(clock);
        int year = now.getYear();
        int month = now.getMonthValue();
        int week = now.get(WeekFields.of(Locale.getDefault()).weekOfYear());

        String userIdStr = userId.toString();

        if ("streak".equalsIgnoreCase(type)) {
            // Streaks are absolute values. We only track all-time/current values.
            // Update global
            String globalKey = "leaderboard:streak:global:all-time";
            redisTemplate.opsForZSet().add(globalKey, userIdStr, increment);

            // Update group-scoped
            if (groupId != null) {
                String groupKey = String.format("leaderboard:streak:%s:all-time", groupId);
                redisTemplate.opsForZSet().add(groupKey, userIdStr, increment);
            }
        } else {
            // For studyHours and tasksCompleted, we increment scores.
            // We maintain three timeframes: all-time, weekly, and monthly.
            String weeklySuffix = String.format("weekly:%d-W%d", year, week);
            String monthlySuffix = String.format("monthly:%d-M%d", year, month);

            String[] ranges = {"all-time", weeklySuffix, monthlySuffix};

            for (String range : ranges) {
                // Update global leaderboard
                String globalKey = String.format("leaderboard:%s:global:%s", type, range);
                redisTemplate.opsForZSet().incrementScore(globalKey, userIdStr, increment);
                setTtlIfPartitioned(globalKey, range);

                // Update group-scoped leaderboard
                if (groupId != null) {
                    String groupKey = String.format("leaderboard:%s:%s:%s", type, groupId, range);
                    redisTemplate.opsForZSet().incrementScore(groupKey, userIdStr, increment);
                    setTtlIfPartitioned(groupKey, range);
                }
            }
        }
    }

    /*
     * WHY REDIS SORTED SETS BEAT SQL ORDER BY + AGGREGATION AT SCALE:
     *
     * 1. Computational Complexity:
     *    - A SQL database executing an ORDER BY with aggregates (SUM, COUNT, etc.) over millions of study sessions
     *      or tasks completed has a complexity of O(N log N) on every query execution, requiring high I/O, heavy CPU utilization,
     *      and temporary table creation, unless heavily indexed (which itself introduces major write lock contention).
     *    - Redis Sorted Sets (ZSETs) are implemented internally using a dual data structure: a Skip List combined with a Hash Map.
     *      - Inserting or updating scores (ZADD / ZINCRBY) executes in O(log N) complexity, maintaining sorting at write time.
     *      - Fetching top ranks (ZREVRANGE) executes in O(log N + M) complexity, where M is the limit requested (e.g. top 10 users).
     *      No on-the-fly sorting or heavy aggregations are required during read requests; the data is pre-sorted.
     *
     * 2. In-Memory Operations:
     *    - Redis runs completely in RAM. All operations bypass the disk bottleneck, yielding sub-millisecond retrieval.
     *
     * 3. Relational DB Relief:
     *    - Offloading rankings to Redis reduces the load on Postgres significantly. Instead of querying full tables,
     *      Postgres is queried only once in a simple primary key lookup (IN clause) to retrieve (hydrate) the top N users' details.
     */
    @Override
    public List<LeaderboardEntryResponse> getLeaderboard(String groupIdStr, String type, String range, int limit) {
        String redisKey = buildRedisKey(groupIdStr, type, range);
        log.info("Fetching leaderboard using Redis key: {}", redisKey);

        // Retrieve top users and scores from Redis Sorted Set (ZREVRANGE)
        Set<TypedTuple<String>> rawEntries = redisTemplate.opsForZSet().reverseRangeWithScores(redisKey, 0, limit - 1);

        if (rawEntries == null || rawEntries.isEmpty()) {
            return Collections.emptyList();
        }

        // Map String User IDs to list of UUIDs for database hydration
        List<UUID> userIds = rawEntries.stream()
                .map(TypedTuple::getValue)
                .filter(Objects::nonNull)
                .map(UUID::fromString)
                .collect(Collectors.toList());

        // Hydrate User details from Postgres database in a single batch query (avoiding N+1 queries)
        List<User> users = userRepository.findAllByIdWithProfile(userIds);
        Map<UUID, User> userMap = users.stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));

        // Map back to response DTO preserving Redis sorted order
        List<LeaderboardEntryResponse> responseEntries = new ArrayList<>();
        int rank = 1;
        for (TypedTuple<String> entry : rawEntries) {
            if (entry.getValue() == null) continue;
            UUID userId = UUID.fromString(entry.getValue());
            User user = userMap.get(userId);

            if (user != null) {
                String name = user.getProfile() != null ? user.getProfile().getName() : user.getUsername();
                String profilePicUrl = user.getProfile() != null ? user.getProfile().getProfilePictureUrl() : null;

                responseEntries.add(LeaderboardEntryResponse.builder()
                        .rank(rank++)
                        .userId(userId)
                        .username(user.getUsername())
                        .name(name)
                        .profilePictureUrl(profilePicUrl)
                        .score(entry.getScore() != null ? entry.getScore() : 0.0)
                        .build());
            }
        }

        return responseEntries;
    }

    private String buildRedisKey(String groupIdStr, String type, String range) {
        String rangeSuffix;

        if ("streak".equalsIgnoreCase(type)) {
            // Streaks are only tracked all-time/current
            rangeSuffix = "all-time";
        } else {
            LocalDate now = LocalDate.now(clock);
            int year = now.getYear();
            int month = now.getMonthValue();
            int week = now.get(WeekFields.of(Locale.getDefault()).weekOfYear());

            if ("weekly".equalsIgnoreCase(range)) {
                rangeSuffix = String.format("weekly:%d-W%d", year, week);
            } else if ("monthly".equalsIgnoreCase(range)) {
                rangeSuffix = String.format("monthly:%d-M%d", year, month);
            } else {
                rangeSuffix = "all-time";
            }
        }

        return String.format("leaderboard:%s:%s:%s", type.toLowerCase(), groupIdStr, rangeSuffix);
    }

    private void setTtlIfPartitioned(String key, String range) {
        if (range.startsWith("weekly")) {
            redisTemplate.expire(key, 14, TimeUnit.DAYS);
        } else if (range.startsWith("monthly")) {
            redisTemplate.expire(key, 60, TimeUnit.DAYS);
        }
    }
}
