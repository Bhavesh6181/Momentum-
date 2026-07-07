package com.momentum.backend.service;

import com.momentum.backend.dto.response.GithubSyncResponse;

import java.util.UUID;

public interface GithubService {
    GithubSyncResponse syncGithubActivity(UUID userId);
    GithubSyncResponse getCachedActivity(UUID userId);
}
