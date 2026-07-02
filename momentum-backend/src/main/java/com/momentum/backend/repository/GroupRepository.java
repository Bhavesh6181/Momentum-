package com.momentum.backend.repository;

import com.momentum.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GroupRepository extends JpaRepository<Group, UUID> {
    Optional<Group> findByInviteCode(String inviteCode);
    List<Group> findByCreatedById(UUID creatorId);
    List<Group> findByNameContainingIgnoreCaseAndIsPrivateFalse(String name);
}
