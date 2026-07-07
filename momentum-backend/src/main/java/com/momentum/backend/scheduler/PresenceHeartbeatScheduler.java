package com.momentum.backend.scheduler;

import com.momentum.backend.service.PresenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PresenceHeartbeatScheduler {

    private final PresenceService presenceService;

    public PresenceHeartbeatScheduler(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    /**
     * Periodically processes disconnect debouncing (grace period check).
     * Runs every 10 seconds.
     */
    @Scheduled(fixedDelay = 10000)
    public void checkDisconnectDebounces() {
        presenceService.processDebouncedDisconnects();
    }
}
