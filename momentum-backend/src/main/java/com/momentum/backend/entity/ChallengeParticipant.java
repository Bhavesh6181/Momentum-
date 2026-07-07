package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "challenge_participants",
    indexes = {
        @Index(name = "idx_challenge_participants_user_id",      columnList = "user_id"),
        @Index(name = "idx_challenge_participants_challenge_id", columnList = "challenge_id")
    }
)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"challenge", "user"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChallengeParticipant {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private ChallengeParticipantId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("challengeId")
    @JoinColumn(name = "challenge_id", nullable = false)
    private Challenge challenge;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "current_progress", nullable = false)
    @Builder.Default
    private double currentProgress = 0.0;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;
}
