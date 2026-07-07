package com.momentum.backend.repository;

import com.momentum.backend.entity.Group;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {
    Optional<Group> findByInviteCode(String inviteCode);
    List<Group> findByCreatedById(UUID creatorId);
    List<Group> findByNameContainingIgnoreCaseAndIsPrivateFalse(String name);

    @Query("SELECT g FROM Group g JOIN GroupMember gm ON g.id = gm.id.groupId " +
           "WHERE gm.id.userId = :userId AND gm.status = com.momentum.backend.enums.GroupMembershipStatus.ACTIVE")
    Page<Group> findJoinedGroups(UUID userId, Pageable pageable);

    @Query("SELECT g FROM Group g WHERE (LOWER(g.name) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (g.isPrivate = false OR g.id IN " +
           "(SELECT gm.id.groupId FROM GroupMember gm WHERE gm.id.userId = :userId AND gm.status = com.momentum.backend.enums.GroupMembershipStatus.ACTIVE))")
    Page<Group> searchGroups(@org.springframework.data.repository.query.Param("query") String query, @org.springframework.data.repository.query.Param("userId") UUID userId, Pageable pageable);
}
