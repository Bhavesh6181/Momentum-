package com.momentum.backend.util;

import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.repository.GroupMemberRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Reusable guard for group-admin-only operations.
 * Used by the Groups module and the Challenges module.
 */
@Component
public class GroupAdminGuard {

    private final GroupMemberRepository groupMemberRepository;

    public GroupAdminGuard(GroupMemberRepository groupMemberRepository) {
        this.groupMemberRepository = groupMemberRepository;
    }

    /**
     * Throws AccessDeniedException if the user is not an ACTIVE ADMIN of the group.
     */
    public void assertIsAdmin(UUID groupId, UUID userId) {
        List<GroupMember> admins = groupMemberRepository.findByGroupIdAndRole(groupId, GroupRole.ADMIN);
        boolean isAdmin = admins.stream()
                .anyMatch(m -> m.getUser().getId().equals(userId)
                        && m.getStatus() == GroupMembershipStatus.ACTIVE);
        if (!isAdmin) {
            throw new AccessDeniedException("Only group admins can perform this action");
        }
    }

    /**
     * Returns true if the user is an ACTIVE member (any role) of the group.
     */
    public boolean isMember(UUID groupId, UUID userId) {
        List<GroupMember> members = groupMemberRepository.findByGroupIdAndStatus(groupId, GroupMembershipStatus.ACTIVE);
        return members.stream().anyMatch(m -> m.getUser().getId().equals(userId));
    }
}
