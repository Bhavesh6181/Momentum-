package com.momentum.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.io.Serializable;
import java.util.UUID;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class ChallengeParticipantId implements Serializable {

    @Column(name = "challenge_id")
    private UUID challengeId;

    @Column(name = "user_id")
    private UUID userId;
}
