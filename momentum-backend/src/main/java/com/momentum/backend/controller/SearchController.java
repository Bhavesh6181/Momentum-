package com.momentum.backend.controller;

import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.SearchResultResponse;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.service.SearchService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/search")
@Slf4j
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public ResponseEntity<?> search(
            @RequestParam(value = "q", required = false) String query,
            @RequestParam(defaultValue = "all") String type,
            Principal principal,
            Pageable pageable
    ) {
        log.info("Unified search request: query='{}', type='{}', user='{}'", query, type, principal.getName());

        if (query == null || query.trim().isEmpty()) {
            throw new ValidationException("Query parameter 'q' cannot be empty");
        }

        String cleanedQuery = query.trim();

        // Full-text search / Elasticsearch is a documented future upgrade if this needs to scale
        if ("all".equalsIgnoreCase(type)) {
            SearchResultResponse response = searchService.searchAll(cleanedQuery, principal.getName());
            return ResponseEntity.ok(ApiResponse.success(response, "Search results retrieved"));
        } else if ("groups".equalsIgnoreCase(type)) {
            Page<SearchResultResponse.GroupSearchDto> page = searchService.searchGroups(cleanedQuery, principal.getName(), pageable);
            return ResponseEntity.ok(ApiResponse.success(page, "Group search results retrieved"));
        } else if ("users".equalsIgnoreCase(type)) {
            Page<SearchResultResponse.UserSearchDto> page = searchService.searchUsers(cleanedQuery, pageable);
            return ResponseEntity.ok(ApiResponse.success(page, "User search results retrieved"));
        } else if ("activities".equalsIgnoreCase(type)) {
            Page<SearchResultResponse.ActivitySearchDto> page = searchService.searchActivities(cleanedQuery, principal.getName(), pageable);
            return ResponseEntity.ok(ApiResponse.success(page, "Activity search results retrieved"));
        } else if ("challenges".equalsIgnoreCase(type)) {
            Page<SearchResultResponse.ChallengeSearchDto> page = searchService.searchChallenges(cleanedQuery, principal.getName(), pageable);
            return ResponseEntity.ok(ApiResponse.success(page, "Challenge search results retrieved"));
        } else {
            throw new ValidationException("Invalid search type. Must be one of: all, groups, users, activities, challenges");
        }
    }
}
