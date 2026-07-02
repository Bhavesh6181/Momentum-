package com.momentum.backend.controller;

import com.momentum.backend.dto.request.PomodoroStartRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.PomodoroSessionResponse;
import com.momentum.backend.service.PomodoroService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/pomodoro")
public class PomodoroController {

    private final PomodoroService pomodoroService;

    public PomodoroController(PomodoroService pomodoroService) {
        this.pomodoroService = pomodoroService;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> startSession(
            @Valid @RequestBody PomodoroStartRequest request,
            Principal principal
    ) {
        PomodoroSessionResponse response = pomodoroService.startSession(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Pomodoro session started successfully"));
    }

    @PostMapping("/{id}/complete-cycle")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> completeCycle(
            @PathVariable UUID id,
            Principal principal
    ) {
        PomodoroSessionResponse response = pomodoroService.completeCycle(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Cycle completed"));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<ApiResponse<PomodoroSessionResponse>> endSession(
            @PathVariable UUID id,
            Principal principal
    ) {
        PomodoroSessionResponse response = pomodoroService.endSession(id, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Pomodoro session ended"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<PomodoroSessionResponse>>> getHistory(
            Principal principal,
            Pageable pageable
    ) {
        Page<PomodoroSessionResponse> history = pomodoroService.getSessionHistory(principal.getName(), pageable);
        return ResponseEntity.ok(ApiResponse.success(history, "Pomodoro history retrieved"));
    }
}
