package com.momentum.backend.controller;

import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.NotificationResponse;
import com.momentum.backend.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/notifications")
@Slf4j
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<NotificationResponse>>> getNotifications(
            Principal principal,
            Pageable pageable
    ) {
        log.info("Fetching notifications for user: {}", principal.getName());
        Page<NotificationResponse> notifications = notificationService.getNotifications(principal.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(notifications, "Notifications retrieved successfully"));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @PathVariable UUID id,
            Principal principal
    ) {
        log.info("Marking notification {} as read for user: {}", id, principal.getName());
        notificationService.markAsRead(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Notification marked as read"));
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(Principal principal) {
        log.info("Marking all notifications as read for user: {}", principal.getName());
        notificationService.markAllAsRead(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "All notifications marked as read"));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Principal principal) {
        log.info("Fetching unread notification count for user: {}", principal.getName());
        long count = notificationService.countUnread(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count retrieved successfully"));
    }
}
