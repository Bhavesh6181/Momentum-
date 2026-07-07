package com.momentum.backend.repository;

import com.momentum.backend.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, UUID> {

    @Query("SELECT n FROM Notification n WHERE n.userId = :userId ORDER BY n.isRead ASC, n.createdAt DESC")
    Page<Notification> findByUserIdOrderByUnreadFirst(@Param("userId") UUID userId, Pageable pageable);

    long countByUserIdAndIsReadFalse(UUID userId);
}
