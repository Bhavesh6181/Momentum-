package com.momentum.backend.repository;

import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.GroupMemberId;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Repository
public interface GroupMemberRepository extends JpaRepository<GroupMember, GroupMemberId> {
    List<GroupMember> findByGroupId(UUID groupId);
    List<GroupMember> findByUserId(UUID userId);
    List<GroupMember> findByGroupIdAndRole(UUID groupId, GroupRole role);
    List<GroupMember> findByGroupIdAndStatus(UUID groupId, GroupMembershipStatus status);
    int countByGroupIdAndStatus(UUID groupId, GroupMembershipStatus status);

    @Query("SELECT gm.id.groupId, COUNT(gm) FROM GroupMember gm " +
           "WHERE gm.id.groupId IN :groupIds AND gm.status = com.momentum.backend.enums.GroupMembershipStatus.ACTIVE " +
           "GROUP BY gm.id.groupId")
    List<Object[]> countMembersByGroupIds(@Param("groupIds") Collection<UUID> groupIds);

    @Query("SELECT gm FROM GroupMember gm JOIN FETCH gm.user WHERE gm.id.groupId = :groupId")
    List<GroupMember> findByGroupIdWithUser(@Param("groupId") UUID groupId);
}
