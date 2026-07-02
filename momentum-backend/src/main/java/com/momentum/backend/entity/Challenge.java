package com.momentum.backend.entity;

import com.momentum.backend.enums.ChallengeStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(
    name = "challenges",
    indexes = {
        @Index(name = "idx_challenges_group_id",        columnList = "group_id"),
        @Index(name = "idx_challenges_status_end_date", columnList = "status, end_date")
    }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"group", "createdBy"})
@ToString(exclude = {"group", "createdBy"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Challenge extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "text")
    private String description;

    @Positive
    @Column(name = "target_value", nullable = false)
    private double targetValue;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String unit;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ChallengeStatus status = ChallengeStatus.OPEN;
}
