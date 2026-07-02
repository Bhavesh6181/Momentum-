package com.momentum.backend.scheduler;

import com.momentum.backend.entity.Group;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.service.GroupAnalyticsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
@Slf4j
public class GroupAnalyticsScheduler {

    private final GroupRepository groupRepository;
    private final GroupAnalyticsService groupAnalyticsService;

    public GroupAnalyticsScheduler(
            GroupRepository groupRepository,
            GroupAnalyticsService groupAnalyticsService
    ) {
        this.groupRepository = groupRepository;
        this.groupAnalyticsService = groupAnalyticsService;
    }

    @Scheduled(cron = "${app.scheduler.group-analytics-cron:0 0 2 * * *}") // Configured via application properties
    @Transactional
    public void computeGroupAnalyticsSnapshots() {
        log.info("Starting nightly GroupAnalyticsSnapshot pre-computation job...");
        
        List<Group> activeGroups = groupRepository.findAll();

        for (Group group : activeGroups) {
            try {
                groupAnalyticsService.updateAnalyticsSnapshot(group.getId());
            } catch (Exception e) {
                log.error("Failed to compute stats snapshot for group: {}", group.getId(), e);
            }
        }
        
        log.info("Nightly GroupAnalyticsSnapshot job completed successfully.");
    }
}
