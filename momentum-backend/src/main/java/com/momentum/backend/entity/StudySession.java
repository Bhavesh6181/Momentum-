package com.momentum.backend.entity;

import com.momentum.backend.enums.SessionStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "study_sessions",
    indexes = {
        @Index(name = "idx_study_sessions_user_id", columnList = "user_id"),
        @Index(name = "idx_study_sessions_group_id", columnList = "group_id"),
        @Index(name = "idx_study_sessions_status", columnList = "status"),
        @Index(name = "idx_study_sessions_created_at", columnList = "created_at")
    }
)
@Data
@EqualsAndHashCode(callSuper = true, exclude = {"user", "group"})
@ToString(exclude = {"user", "group"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudySession extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @NotBlank
    @Size(max = 100)
    @Column(nullable = false, length = 100)
    private String subject;

    @Column(columnDefinition = "text")
    private String goal;

    @NotNull
    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    @Column(name = "end_time")
    private OffsetDateTime endTime;

    @Column(name = "duration_minutes")
    private Integer durationMinutes;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SessionStatus status;
}
