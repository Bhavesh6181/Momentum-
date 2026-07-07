package com.momentum.backend.entity;

import com.momentum.backend.enums.NotificationType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@Entity
@Table(
    name = "notifications",
    indexes = {
        @Index(name = "idx_notifications_user_id", columnList = "user_id"),
        @Index(name = "idx_notifications_is_read", columnList = "is_read"),
        @Index(name = "idx_notifications_created_at", columnList = "created_at")
    }
)
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotNull
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private NotificationType type;

    @NotNull
    @Column(nullable = false, columnDefinition = "text")
    private String message;

    @Column(columnDefinition = "text")
    private String metadata;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private boolean isRead = false;
}
