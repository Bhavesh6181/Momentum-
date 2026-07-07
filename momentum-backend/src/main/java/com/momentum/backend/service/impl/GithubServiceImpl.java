package com.momentum.backend.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.momentum.backend.dto.response.GithubSyncResponse;
import com.momentum.backend.entity.GithubSyncState;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.event.GithubPushEvent;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.repository.GithubSyncStateRepository;
import com.momentum.backend.repository.UserProfileRepository;
import com.momentum.backend.service.GithubService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
@Slf4j
public class GithubServiceImpl implements GithubService {

    private static final String GITHUB_CACHE_KEY_PREFIX = "github:cache:";
    private static final long CACHE_TTL_SECONDS = 3600L; // 1 hour

    private final UserProfileRepository userProfileRepository;
    private final GithubSyncStateRepository githubSyncStateRepository;
    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final RestTemplate restTemplate;
    private final Clock clock;

    @org.springframework.beans.factory.annotation.Autowired
    public GithubServiceImpl(
            UserProfileRepository userProfileRepository,
            GithubSyncStateRepository githubSyncStateRepository,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            Clock clock
    ) {
        this.userProfileRepository = userProfileRepository;
        this.githubSyncStateRepository = githubSyncStateRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.restTemplate = new RestTemplate();
        this.clock = clock;
    }

    // Constructor to allow mock RestTemplate injection in tests
    public GithubServiceImpl(
            UserProfileRepository userProfileRepository,
            GithubSyncStateRepository githubSyncStateRepository,
            StringRedisTemplate redisTemplate,
            ObjectMapper objectMapper,
            ApplicationEventPublisher eventPublisher,
            RestTemplate restTemplate,
            Clock clock
    ) {
        this.userProfileRepository = userProfileRepository;
        this.githubSyncStateRepository = githubSyncStateRepository;
        this.redisTemplate = redisTemplate;
        this.objectMapper = objectMapper;
        this.eventPublisher = eventPublisher;
        this.restTemplate = restTemplate;
        this.clock = clock;
    }

    @Override
    @Transactional
    public GithubSyncResponse syncGithubActivity(UUID userId) {
        // 1. Check cache first
        GithubSyncResponse cached = getCachedResponse(userId);
        if (cached != null) {
            log.info("Serving GitHub sync response from cache for user: {}", userId);
            return cached;
        }

        // 2. Fetch UserProfile to get github link/username
        UserProfile profile = userProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User profile not found"));

        String githubLink = profile.getGithubLink();
        if (githubLink == null || githubLink.isBlank()) {
            throw new ValidationException("GitHub username/link not set in profile");
        }

        String username = githubLink;
        if (githubLink.contains("/")) {
            username = githubLink.substring(githubLink.lastIndexOf("/") + 1);
        }

        log.info("Syncing GitHub activity for user: {}, username: {}", userId, username);

        int repoCount = 0;
        int contributionCount = 0;
        List<GithubSyncResponse.RepoActivity> repoActivities = new ArrayList<>();

        try {
            // Fetch public repo count
            String userUrl = "https://api.github.com/users/" + username;
            ResponseEntity<String> userResponse = restTemplate.getForEntity(userUrl, String.class);
            if (userResponse.getBody() != null) {
                JsonNode userJson = objectMapper.readTree(userResponse.getBody());
                repoCount = userJson.path("public_repos").asInt();
            }

            // Fetch public events
            String eventsUrl = "https://api.github.com/users/" + username + "/events/public";
            ResponseEntity<String> eventsResponse = restTemplate.getForEntity(eventsUrl, String.class);
            if (eventsResponse.getBody() != null) {
                JsonNode eventsJson = objectMapper.readTree(eventsResponse.getBody());

                // Calculate contribution count (sum of all commits in public events)
                for (JsonNode event : eventsJson) {
                    if ("PushEvent".equals(event.path("type").asText())) {
                        contributionCount += event.path("payload").path("commits").size();
                    }
                }

                // Process unique repositories and detect new commits
                Map<String, JsonNode> latestPushPerRepo = new LinkedHashMap<>();
                for (JsonNode event : eventsJson) {
                    if ("PushEvent".equals(event.path("type").asText())) {
                        String repoName = event.path("repo").path("name").asText();
                        latestPushPerRepo.putIfAbsent(repoName, event);
                    }
                }

                OffsetDateTime now = OffsetDateTime.now(clock);

                for (Map.Entry<String, JsonNode> entry : latestPushPerRepo.entrySet()) {
                    String repoName = entry.getKey();
                    JsonNode pushEvent = entry.getValue();
                    JsonNode commits = pushEvent.path("payload").path("commits");

                    if (commits.isArray() && commits.size() > 0) {
                        JsonNode latestCommit = commits.get(0);
                        String latestSha = latestCommit.path("sha").asText();
                        String latestMessage = latestCommit.path("message").asText();
                        int size = commits.size();

                        Optional<GithubSyncState> stateOpt = githubSyncStateRepository.findByUserIdAndRepoName(userId, repoName);
                        int newCommits = 0;

                        if (stateOpt.isPresent()) {
                            GithubSyncState state = stateOpt.get();
                            if (!state.getLastCommitSha().equals(latestSha)) {
                                newCommits = size;
                                state.setLastCommitSha(latestSha);
                                state.setLastSyncedAt(now);
                                githubSyncStateRepository.save(state);

                                // Trigger event
                                eventPublisher.publishEvent(new GithubPushEvent(userId, repoName, latestSha, newCommits));
                            }
                        } else {
                            // First time sync, initialize database state but do not trigger push event (no previous state to compare against)
                            GithubSyncState state = GithubSyncState.builder()
                                    .userId(userId)
                                    .repoName(repoName)
                                    .lastCommitSha(latestSha)
                                    .lastSyncedAt(now)
                                    .build();
                            githubSyncStateRepository.save(state);
                        }

                        repoActivities.add(GithubSyncResponse.RepoActivity.builder()
                                .repoName(repoName)
                                .lastCommitSha(latestSha)
                                .lastCommitMessage(latestMessage)
                                .newCommitsCount(newCommits)
                                .build());
                    }
                }
            }

        } catch (HttpClientErrorException.NotFound e) {
            throw new ResourceNotFoundException("GitHub user not found: " + username);
        } catch (HttpClientErrorException.Forbidden e) {
            log.warn("GitHub API rate limit exceeded for user {}", username);
            throw new ValidationException("GitHub API rate limit exceeded. Please try again later.");
        } catch (Exception e) {
            log.error("Failed to sync GitHub profile for user {}", username, e);
            throw new ValidationException("Failed to sync GitHub profile: " + e.getMessage());
        }

        GithubSyncResponse response = GithubSyncResponse.builder()
                .githubUsername(username)
                .repoCount(repoCount)
                .contributionCount(contributionCount)
                .recentRepositories(repoActivities)
                .syncedAt(OffsetDateTime.now(clock))
                .build();

        // 3. Cache in Redis
        cacheResponse(userId, response);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public GithubSyncResponse getCachedActivity(UUID userId) {
        GithubSyncResponse cached = getCachedResponse(userId);
        if (cached == null) {
            throw new ResourceNotFoundException("No cached activity found. Please sync first.");
        }
        return cached;
    }

    private GithubSyncResponse getCachedResponse(UUID userId) {
        try {
            String json = redisTemplate.opsForValue().get(GITHUB_CACHE_KEY_PREFIX + userId);
            if (json != null) {
                return objectMapper.readValue(json, GithubSyncResponse.class);
            }
        } catch (Exception e) {
            log.error("Failed to get cached github sync data for user {}", userId, e);
        }
        return null;
    }

    private void cacheResponse(UUID userId, GithubSyncResponse response) {
        try {
            String json = objectMapper.writeValueAsString(response);
            redisTemplate.opsForValue().set(
                    GITHUB_CACHE_KEY_PREFIX + userId,
                    json,
                    CACHE_TTL_SECONDS,
                    TimeUnit.SECONDS
            );
        } catch (Exception e) {
            log.error("Failed to cache github sync data in Redis for user {}", userId, e);
        }
    }
}
