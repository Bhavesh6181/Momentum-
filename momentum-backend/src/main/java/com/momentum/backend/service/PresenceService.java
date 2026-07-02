package com.momentum.backend.service;

import com.momentum.backend.dto.PresenceInfo;
import com.momentum.backend.dto.response.MemberPresenceResponse;
import com.momentum.backend.enums.PresenceStatus;

import java.util.List;
import java.util.UUID;

public interface PresenceService {
    void updatePresence(String username, PresenceStatus status);
    PresenceInfo getPresence(UUID userId);
    List<MemberPresenceResponse> getOnlineMembers(UUID groupId);
    void handleDisconnect(String username);
    void processDebouncedDisconnects();
}
