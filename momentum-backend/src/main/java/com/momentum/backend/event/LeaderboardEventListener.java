package com.momentum.backend.event;

import com.momentum.backend.service.LeaderboardService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@Slf4j
public class LeaderboardEventListener {

    private final LeaderboardService leaderboardService;

    public LeaderboardEventListener(LeaderboardService leaderboardService) {
        this.leaderboardService = leaderboardService;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handleLeaderboardUpdated(LeaderboardUpdatedEvent event) {
        log.info("Handling LeaderboardUpdatedEvent: user={}, group={}, type={}, delta={}",
                event.getUserId(), event.getGroupId(), event.getType(), event.getScoreDelta());
        leaderboardService.updateScore(event.getUserId(), event.getGroupId(), event.getType(), event.getScoreDelta());
    }
}
