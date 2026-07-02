package com.momentum.backend.service;

import com.momentum.backend.dto.request.GroupCreateRequest;
import com.momentum.backend.dto.request.GroupSettingsUpdateRequest;
import com.momentum.backend.dto.response.GroupResponse;

import java.util.UUID;

public interface GroupLifecycleService {
    GroupResponse createGroup(String username, GroupCreateRequest request);
    GroupResponse updateSettings(UUID groupId, GroupSettingsUpdateRequest request);
    void deleteGroup(UUID groupId);
}
