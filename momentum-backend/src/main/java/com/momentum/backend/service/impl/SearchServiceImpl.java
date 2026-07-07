package com.momentum.backend.service.impl;

import com.momentum.backend.dto.response.SearchResultResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.repository.*;
import com.momentum.backend.service.SearchService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class SearchServiceImpl implements SearchService {

    private final GroupRepository groupRepository;
    private final UserProfileRepository userProfileRepository;
    private final ActivityRepository activityRepository;
    private final ChallengeRepository challengeRepository;
    private final UserRepository userRepository;

    public SearchServiceImpl(
            GroupRepository groupRepository,
            UserProfileRepository userProfileRepository,
            ActivityRepository activityRepository,
            ChallengeRepository challengeRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.userProfileRepository = userProfileRepository;
        this.activityRepository = activityRepository;
        this.challengeRepository = challengeRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public SearchResultResponse searchAll(String query, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        UUID userId = user.getId();

        PageRequest limit5 = PageRequest.of(0, 5);

        var groupsPage = groupRepository.searchGroups(query, userId, limit5);
        var usersPage = userProfileRepository.searchUserProfiles(query, limit5);
        var activitiesPage = activityRepository.searchActivities(query, userId, limit5);
        var challengesPage = challengeRepository.searchChallenges(query, userId, limit5);

        return SearchResultResponse.builder()
                .groups(groupsPage.map(g -> SearchResultResponse.GroupSearchDto.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .description(g.getDescription())
                        .isPrivate(g.isPrivate())
                        .build()).getContent())
                .users(usersPage.map(up -> SearchResultResponse.UserSearchDto.builder()
                        .id(up.getUser().getId())
                        .username(up.getUser().getUsername())
                        .name(up.getName())
                        .profilePictureUrl(up.getProfilePictureUrl())
                        .build()).getContent())
                .activities(activitiesPage.map(a -> SearchResultResponse.ActivitySearchDto.builder()
                        .id(a.getId())
                        .description(a.getDescription())
                        .type(a.getType().name())
                        .createdAt(a.getCreatedAt())
                        .build()).getContent())
                .challenges(challengesPage.map(c -> SearchResultResponse.ChallengeSearchDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .status(c.getStatus().name())
                        .build()).getContent())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SearchResultResponse.GroupSearchDto> searchGroups(String query, String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return groupRepository.searchGroups(query, user.getId(), pageable)
                .map(g -> SearchResultResponse.GroupSearchDto.builder()
                        .id(g.getId())
                        .name(g.getName())
                        .description(g.getDescription())
                        .isPrivate(g.isPrivate())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SearchResultResponse.UserSearchDto> searchUsers(String query, Pageable pageable) {
        return userProfileRepository.searchUserProfiles(query, pageable)
                .map(up -> SearchResultResponse.UserSearchDto.builder()
                        .id(up.getUser().getId())
                        .username(up.getUser().getUsername())
                        .name(up.getName())
                        .profilePictureUrl(up.getProfilePictureUrl())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SearchResultResponse.ActivitySearchDto> searchActivities(String query, String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return activityRepository.searchActivities(query, user.getId(), pageable)
                .map(a -> SearchResultResponse.ActivitySearchDto.builder()
                        .id(a.getId())
                        .description(a.getDescription())
                        .type(a.getType().name())
                        .createdAt(a.getCreatedAt())
                        .build());
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SearchResultResponse.ChallengeSearchDto> searchChallenges(String query, String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return challengeRepository.searchChallenges(query, user.getId(), pageable)
                .map(c -> SearchResultResponse.ChallengeSearchDto.builder()
                        .id(c.getId())
                        .title(c.getTitle())
                        .description(c.getDescription())
                        .status(c.getStatus().name())
                        .build());
    }
}
