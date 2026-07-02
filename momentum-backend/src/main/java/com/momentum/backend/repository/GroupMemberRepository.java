package com.momentum.backend.repository;

import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.GroupMemberId;
import com.momentum.backend.enums.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(Long groupId);
    List<GroupMember> findByUserId(Long userId);
    List<GroupMember> findByGroupIdAndRole(Long groupId, GroupRole role);
}
