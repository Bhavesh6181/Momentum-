package com.momentum.backend.entity;

import com.momentum.backend.enums.GoalStatus;
import com.momentum.backend.enums.GoalType;
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
    name = "goals",
    indexes = {
        @Index(name = "idx_goals_user_id",         columnList = "user_id"),
        @Index(name = "idx_goals_group_id",         columnList = "group_id"),
        @Index(name = "idx_goals_status_end_date",  columnList = "status, end_date"),
        @Index(name = "idx_goals_type",             columnList = "type")
    }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"user", "group"})
@ToString(exclude = {"user", "group"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Goal extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    /** Nullable — personal goals have no group */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GoalType type;

    @NotBlank
    @Size(max = 200)
    @Column(nullable = false, length = 200)
    private String title;

    @Positive
    @Column(name = "target_value", nullable = false)
    private double targetValue;

    @Column(name = "current_value", nullable = false)
    @Builder.Default
    private double currentValue = 0.0;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, length = 50)
    private String unit;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GoalStatus status = GoalStatus.IN_PROGRESS;

    @NotNull
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;

    @NotNull
    @Column(name = "end_date", nullable = false)
    private LocalDate endDate;
}
