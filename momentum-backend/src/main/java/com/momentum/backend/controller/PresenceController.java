package com.momentum.backend.controller;

import com.momentum.backend.dto.request.PresenceUpdateRequest;
import com.momentum.backend.service.PresenceService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

import java.security.Principal;

@Controller
@Slf4j
public class PresenceController {

    private final PresenceService presenceService;

    public PresenceController(PresenceService presenceService) {
        this.presenceService = presenceService;
    }

    @MessageMapping("/presence/update")
    public void updatePresence(PresenceUpdateRequest request, Principal principal) {
        if (principal != null) {
            String username = principal.getName();
            presenceService.updatePresence(username, request.getStatus());
        }
    }
}
