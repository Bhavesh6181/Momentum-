package com.momentum.backend.repository;

import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.GroupMemberId;
import com.momentum.backend.enums.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(UUID groupId);
    List<GroupMember> findByUserId(UUID userId);
    List<GroupMember> findByGroupIdAndRole(UUID groupId, GroupRole role);
    List<GroupMember> findByGroupIdAndRoleIn(UUID groupId, Collection<GroupRole> roles);
    int countByGroupIdAndRoleIn(UUID groupId, Collection<GroupRole> roles);
}
