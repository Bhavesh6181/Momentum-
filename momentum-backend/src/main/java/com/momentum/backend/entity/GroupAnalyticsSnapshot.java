package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "group_analytics_snapshots")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupAnalyticsSnapshot {

    @Id
    @Column(name = "group_id")
    private UUID groupId;

    @Column(name = "total_study_hours_this_week", nullable = false)
    @Builder.Default
    private double totalStudyHoursThisWeek = 0.0;

    @Column(name = "most_active_member_id")
    private UUID mostActiveMemberId;

    @Column(name = "most_active_member_username", length = 50)
    private String mostActiveMemberUsername;

    @Column(name = "last_computed_at", nullable = false)
    @Builder.Default
    private OffsetDateTime lastComputedAt = OffsetDateTime.now();
}
