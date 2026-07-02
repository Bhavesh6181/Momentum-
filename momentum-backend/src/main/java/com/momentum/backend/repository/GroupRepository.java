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
           "WHERE gm.id.userId = :userId AND gm.role IN (com.momentum.backend.enums.GroupRole.ADMIN, com.momentum.backend.enums.GroupRole.MEMBER)")
    Page<Group> findJoinedGroups(UUID userId, Pageable pageable);
}
