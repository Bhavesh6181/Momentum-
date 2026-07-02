package com.momentum.backend.repository;

import com.momentum.backend.entity.Group;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface GroupRepository extends JpaRepository<Group, Long> {
    Optional<Group> findByInviteCode(String inviteCode);
    List<Group> findByCreatedById(Long creatorId);
    List<Group> findByNameContainingIgnoreCaseAndIsPrivateFalse(String name);
}
