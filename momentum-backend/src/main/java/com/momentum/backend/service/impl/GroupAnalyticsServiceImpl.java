package com.momentum.backend.service.impl;

import com.momentum.backend.entity.Group;
import com.momentum.backend.entity.GroupAnalyticsSnapshot;
import com.momentum.backend.entity.StudySession;
import com.momentum.backend.entity.User;
import com.momentum.backend.enums.SessionStatus;
import com.momentum.backend.repository.GroupAnalyticsSnapshotRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.StudySessionRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.GroupAnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Slf4j
public class GroupAnalyticsServiceImpl implements GroupAnalyticsService {

    private final GroupRepository groupRepository;
    private final StudySessionRepository studySessionRepository;
    private final GroupAnalyticsSnapshotRepository snapshotRepository;
    private final UserRepository userRepository;

    public GroupAnalyticsServiceImpl(
            GroupRepository groupRepository,
            StudySessionRepository studySessionRepository,
            GroupAnalyticsSnapshotRepository snapshotRepository,
            UserRepository userRepository
    ) {
        this.groupRepository = groupRepository;
        this.studySessionRepository = studySessionRepository;
        this.snapshotRepository = snapshotRepository;
        this.userRepository = userRepository;
    }

    @Override
    @Transactional
    public void updateAnalyticsSnapshot(UUID groupId) {
        Group group = groupRepository.findById(groupId).orElse(null);
        if (group == null) {
            return;
        }

        OffsetDateTime oneWeekAgo = OffsetDateTime.now().minusDays(7);

        try {
            // Fetch completed study sessions in the last 7 days for the group
            List<StudySession> sessions = studySessionRepository.findByGroupIdAndStatusAndStartTimeAfter(
                    groupId,
                    SessionStatus.COMPLETED,
                    oneWeekAgo
            );

            // Calculate total study hours this week
            double totalStudyHours = sessions.stream()
                    .mapToDouble(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() / 60.0 : 0.0)
                    .sum();

            // Group duration sum by userId to identify the most active member
            Map<UUID, Integer> memberDurations = sessions.stream()
                    .collect(Collectors.groupingBy(
                            s -> s.getUser().getId(),
                            Collectors.summingInt(s -> s.getDurationMinutes() != null ? s.getDurationMinutes() : 0)
                    ));

            UUID mostActiveMemberId = null;
            String mostActiveMemberUsername = null;

            if (!memberDurations.isEmpty()) {
                mostActiveMemberId = memberDurations.entrySet().stream()
                        .max(Map.Entry.comparingByValue())
                        .map(Map.Entry::getKey)
                        .orElse(null);

                if (mostActiveMemberId != null) {
                    User user = userRepository.findById(mostActiveMemberId).orElse(null);
                    if (user != null) {
                        mostActiveMemberUsername = user.getUsername();
                    }
                }
            }

            GroupAnalyticsSnapshot snapshot = GroupAnalyticsSnapshot.builder()
                    .groupId(groupId)
                    .totalStudyHoursThisWeek(totalStudyHours)
                    .mostActiveMemberId(mostActiveMemberId)
                    .mostActiveMemberUsername(mostActiveMemberUsername)
                    .lastComputedAt(OffsetDateTime.now())
                    .build();

            snapshotRepository.save(snapshot);
            log.debug("Computed stats snapshot for group: {} (Total Hours: {})", group.getName(), totalStudyHours);
        } catch (Exception e) {
            log.error("Failed to compute stats snapshot for group: {}", groupId, e);
        }
    }
}
