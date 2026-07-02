package com.momentum.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.Filter;
import org.hibernate.annotations.FilterDef;
import org.hibernate.annotations.SQLDelete;

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
@FilterDef(name = "excludeDeletedGroup", defaultCondition = "deleted_at IS NULL")
@Filter(name = "excludeDeletedGroup")
@Data
@EqualsAndHashCode(callSuper = true, exclude = "createdBy")
@ToString(exclude = "createdBy")
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Group extends BaseEntity {

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

    @Column(name = "deleted_at")
    private OffsetDateTime deletedAt;
}
