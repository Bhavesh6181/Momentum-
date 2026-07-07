package com.momentum.backend.repository;

import com.momentum.backend.entity.GroupAnalyticsSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface GroupAnalyticsSnapshotRepository extends JpaRepository<GroupAnalyticsSnapshot, UUID> {
}
