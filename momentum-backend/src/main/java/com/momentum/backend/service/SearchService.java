package com.momentum.backend.service;

import com.momentum.backend.dto.response.SearchResultResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface SearchService {
    SearchResultResponse searchAll(String query, String username);
    Page<SearchResultResponse.GroupSearchDto> searchGroups(String query, String username, Pageable pageable);
    Page<SearchResultResponse.UserSearchDto> searchUsers(String query, Pageable pageable);
    Page<SearchResultResponse.ActivitySearchDto> searchActivities(String query, String username, Pageable pageable);
    Page<SearchResultResponse.ChallengeSearchDto> searchChallenges(String query, String username, Pageable pageable);
}
