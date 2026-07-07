package com.momentum.backend.repository;

import com.momentum.backend.entity.Challenge;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface ChallengeRepository extends JpaRepository<Challenge, UUID> {

    @Query("SELECT c FROM Challenge c WHERE c.group.id = :groupId")
    Page<Challenge> findByGroupId(@Param("groupId") UUID groupId, Pageable pageable);

    /** Used by the nightly scheduler to close expired challenges */
    @Modifying
    @Query("UPDATE Challenge c SET c.status = 'CLOSED' " +
           "WHERE c.status = 'OPEN' AND c.endDate < :today")
    int closeExpiredChallenges(@Param("today") LocalDate today);

    @Query("SELECT c FROM Challenge c WHERE (LOWER(c.title) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "AND (c.group.isPrivate = false OR c.group.id IN " +
           "(SELECT gm.id.groupId FROM GroupMember gm WHERE gm.id.userId = :userId AND gm.status = com.momentum.backend.enums.GroupMembershipStatus.ACTIVE))")
    Page<Challenge> searchChallenges(@Param("query") String query, @Param("userId") UUID userId, Pageable pageable);
}
