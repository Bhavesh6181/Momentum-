package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "groups",
    indexes = {
        @Index(name = "idx_groups_created_by", columnList = "created_by"),
        @Index(name = "idx_groups_invite_code_active", columnList = "invite_code"),
        @Index(name = "idx_groups_deleted_at", columnList = "deleted_at")
    }
)
@SQLDelete(sql = "UPDATE groups SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "createdBy")
@EqualsAndHashCode(exclude = "createdBy")
public class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "text")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Column(name = "is_private", nullable = false)
    @Builder.Default
    private boolean isPrivate = false;

    @Column(name = "invite_code", nullable = false, unique = true, length = 50)
    private String inviteCode;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
