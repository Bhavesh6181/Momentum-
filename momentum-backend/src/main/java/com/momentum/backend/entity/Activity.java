package com.momentum.backend.entity;

import com.momentum.backend.enums.ActivityType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "activities",
    indexes = {
        @Index(name = "idx_activities_group_id", columnList = "group_id, created_at DESC"),
        @Index(name = "idx_activities_user_id", columnList = "user_id"),
        @Index(name = "idx_activities_created_at", columnList = "created_at DESC")
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"user", "group"})
@EqualsAndHashCode(exclude = {"user", "group"})
public class Activity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "group_id")
    private Group group;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActivityType type;

    @Column(columnDefinition = "text")
    private String description;

    @Column(columnDefinition = "text")
    private String metadata; // JSON stored as text

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;
}
