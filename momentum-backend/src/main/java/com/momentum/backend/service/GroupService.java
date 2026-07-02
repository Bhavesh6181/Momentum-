package com.momentum.backend.service;

import com.momentum.backend.dto.request.GroupCreateRequest;
import com.momentum.backend.dto.request.GroupSettingsUpdateRequest;
import com.momentum.backend.dto.response.GroupDetailsResponse;
import com.momentum.backend.dto.response.GroupResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GroupService {
    GroupResponse createGroup(String username, GroupCreateRequest request);
    Page<GroupResponse> getMyGroups(String username, Pageable pageable);
    GroupDetailsResponse getGroupDetails(UUID groupId, String username);
    void joinGroup(UUID groupId, String username, String inviteCode);
    void approveMember(UUID groupId, UUID userId);
    void removeMember(UUID groupId, UUID userId);
    GroupResponse updateSettings(UUID groupId, GroupSettingsUpdateRequest request);
    void deleteGroup(UUID groupId);
}
