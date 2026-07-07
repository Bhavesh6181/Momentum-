package com.momentum.backend.repository;

import com.momentum.backend.entity.ChallengeParticipant;
import com.momentum.backend.entity.ChallengeParticipantId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ChallengeParticipantRepository extends JpaRepository<ChallengeParticipant, ChallengeParticipantId> {

    /** Leaderboard: participants sorted by progress descending */
    @Query("SELECT cp FROM ChallengeParticipant cp " +
           "JOIN FETCH cp.user " +
           "WHERE cp.id.challengeId = :challengeId " +
           "ORDER BY cp.currentProgress DESC")
    Page<ChallengeParticipant> findLeaderboard(@Param("challengeId") UUID challengeId, Pageable pageable);

    @Query("SELECT cp FROM ChallengeParticipant cp " +
           "WHERE cp.id.challengeId = :challengeId AND cp.id.userId = :userId")
    Optional<ChallengeParticipant> findByParticipant(
            @Param("challengeId") UUID challengeId,
            @Param("userId") UUID userId
    );
}
