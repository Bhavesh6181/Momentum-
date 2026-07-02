package com.momentum.backend.controller;

import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.MemberPresenceResponse;
import com.momentum.backend.service.PresenceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups/{groupId}/online-members")
public class PresenceRestController {

    private final PresenceService presenceService;

    public PresenceRestController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MemberPresenceResponse>>> getOnlineMembers(@PathVariable UUID groupId) {
        List<MemberPresenceResponse> members = presenceService.getOnlineMembers(groupId);
        return ResponseEntity.ok(ApiResponse.success(members, "Group members' presence retrieved successfully"));
    }
}
