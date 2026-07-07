package com.momentum.backend.service.impl;

import com.momentum.backend.dto.response.NotificationResponse;
import com.momentum.backend.entity.Notification;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.NotificationType;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.repository.NotificationRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public NotificationServiceImpl(
            NotificationRepository notificationRepository,
            UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate
    ) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    @Transactional
    public void createNotification(UUID userId, NotificationType type, String message, String metadata) {
        Notification notification = Notification.builder()
                .userId(userId)
                .type(type)
                .message(message)
                .metadata(metadata)
                .isRead(false)
                .build();

        Notification saved = notificationRepository.save(notification);
        NotificationResponse response = mapToResponse(saved);

        // Push in real time via STOMP user destinations and explicit topics
        messagingTemplate.convertAndSendToUser(userId.toString(), "/topic/notifications", response);
        messagingTemplate.convertAndSend("/topic/user/" + userId + "/notifications", response);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<NotificationResponse> getNotifications(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.findByUserIdOrderByUnreadFirst(user.getId(), pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public void markAsRead(UUID notificationId, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));

        if (!notification.getUserId().equals(user.getId())) {
            throw new ResourceNotFoundException("Notification not found");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        List<Notification> unread = notificationRepository.findAll().stream()
                .filter(n -> n.getUserId().equals(user.getId()) && !n.isRead())
                .toList();
        for (Notification n : unread) {
            n.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    @Override
    @Transactional(readOnly = true)
    public long countUnread(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return notificationRepository.countByUserIdAndIsReadFalse(user.getId());
    }

    private NotificationResponse mapToResponse(Notification notification) {
        return NotificationResponse.builder()
                .id(notification.getId())
                .userId(notification.getUserId())
                .type(notification.getType())
                .message(notification.getMessage())
                .metadata(notification.getMetadata())
                .isRead(notification.isRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}
