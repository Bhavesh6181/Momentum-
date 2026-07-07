package com.momentum.backend.service;

import com.momentum.backend.dto.response.NotificationResponse;
import com.momentum.backend.enums.NotificationType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface NotificationService {
    void createNotification(UUID userId, NotificationType type, String message, String metadata);
    Page<NotificationResponse> getNotifications(String username, Pageable pageable);
    void markAsRead(UUID notificationId, String username);
    void markAllAsRead(String username);
    long countUnread(String username);
}
