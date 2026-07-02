package com.momentum.backend.service;

import java.util.UUID;

public interface GroupMembershipService {
    void joinGroup(UUID groupId, String username, String inviteCode);
    void approveMember(UUID groupId, UUID userId);
    void removeMember(UUID groupId, UUID userId);
}
