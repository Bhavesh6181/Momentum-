package com.momentum.backend.entity;

import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;

@Entity
@Table(
    name = "group_members",
    indexes = {
        @Index(name = "idx_group_members_user_id", columnList = "user_id")
    }
)
@Data
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(exclude = {"group", "user"})
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupMember {

    @EmbeddedId
    @EqualsAndHashCode.Include
    private GroupMemberId id;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("groupId")
    @JoinColumn(name = "group_id", nullable = false)
    private Group group;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("userId")
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GroupRole role;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private GroupMembershipStatus status = GroupMembershipStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;
}
