package com.momentum.backend.entity;

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
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = {"group", "user"})
@EqualsAndHashCode(exclude = {"group", "user"})
public class GroupMember {

    @EmbeddedId
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

    @CreationTimestamp
    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;
}
