package com.momentum.backend.controller;

import com.momentum.backend.dto.request.GroupCreateRequest;
import com.momentum.backend.dto.request.GroupJoinRequest;
import com.momentum.backend.dto.request.GroupSettingsUpdateRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.GroupDetailsResponse;
import com.momentum.backend.dto.response.GroupResponse;
import com.momentum.backend.security.GroupAdminOnly;
import com.momentum.backend.service.GroupService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/groups")
public class GroupController {

    private final GroupService groupService;

    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<GroupResponse>> createGroup(
            @Valid @RequestBody GroupCreateRequest request,
            Principal principal
    ) {
        GroupResponse response = groupService.createGroup(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Group created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<GroupResponse>>> getMyGroups(
            Principal principal,
            Pageable pageable
    ) {
        Page<GroupResponse> response = groupService.getMyGroups(principal.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "My groups retrieved successfully"));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<ApiResponse<GroupDetailsResponse>> getGroupDetails(
            @PathVariable("groupId") UUID groupId,
            Principal principal
    ) {
        GroupDetailsResponse response = groupService.getGroupDetails(groupId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Group details retrieved successfully"));
    }

    @PostMapping("/{groupId}/join")
    public ResponseEntity<ApiResponse<Void>> joinGroup(
            @PathVariable("groupId") UUID groupId,
            @RequestBody(required = false) GroupJoinRequest request,
            Principal principal
    ) {
        String inviteCode = request != null ? request.getInviteCode() : null;
        groupService.joinGroup(groupId, principal.getName(), inviteCode);
        return ResponseEntity.ok(ApiResponse.success(null, "Join operation processed"));
    }

    @PostMapping("/{groupId}/members/{userId}/approve")
    @GroupAdminOnly
    public ResponseEntity<ApiResponse<Void>> approveMember(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId
    ) {
        groupService.approveMember(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member request approved"));
    }

    @DeleteMapping("/{groupId}/members/{userId}")
    @GroupAdminOnly
    public ResponseEntity<ApiResponse<Void>> removeMember(
            @PathVariable("groupId") UUID groupId,
            @PathVariable("userId") UUID userId
    ) {
        groupService.removeMember(groupId, userId);
        return ResponseEntity.ok(ApiResponse.success(null, "Member removed from group"));
    }

    @PutMapping("/{groupId}/settings")
    @GroupAdminOnly
    public ResponseEntity<ApiResponse<GroupResponse>> updateSettings(
            @PathVariable("groupId") UUID groupId,
            @Valid @RequestBody GroupSettingsUpdateRequest request
    ) {
        GroupResponse response = groupService.updateSettings(groupId, request);
        return ResponseEntity.ok(ApiResponse.success(response, "Group settings updated successfully"));
    }

    @DeleteMapping("/{groupId}")
    @GroupAdminOnly
    public ResponseEntity<ApiResponse<Void>> deleteGroup(@PathVariable("groupId") UUID groupId) {
        groupService.deleteGroup(groupId);
        return ResponseEntity.ok(ApiResponse.success(null, "Group deleted successfully"));
    }
}
