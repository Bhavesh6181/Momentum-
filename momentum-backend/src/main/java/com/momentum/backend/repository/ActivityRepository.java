package com.momentum.backend.repository;

import com.momentum.backend.entity.Activity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, UUID> {

    @Query("SELECT a FROM Activity a JOIN FETCH a.user WHERE a.group.id = :groupId ORDER BY a.createdAt DESC")
    Page<Activity> findByGroupIdOrderByCreatedAtDesc(@Param("groupId") UUID groupId, Pageable pageable);

    @Query("SELECT a FROM Activity a WHERE (LOWER(a.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (a.group IS NULL OR a.group.isPrivate = false OR a.group.id IN " +
           "(SELECT gm.id.groupId FROM GroupMember gm WHERE gm.id.userId = :userId AND gm.status = com.momentum.backend.enums.GroupMembershipStatus.ACTIVE))")
    Page<Activity> searchActivities(@Param("query") String query, @Param("userId") UUID userId, Pageable pageable);
}
