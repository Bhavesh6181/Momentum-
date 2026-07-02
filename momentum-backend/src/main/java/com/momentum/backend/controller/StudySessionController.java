package com.momentum.backend.controller;

import com.momentum.backend.dto.request.StudySessionStartRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.StudySessionResponse;
import com.momentum.backend.service.StudySessionService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/sessions")
public class StudySessionController {

    private final StudySessionService studySessionService;

    public StudySessionController(StudySessionService studySessionService) {
        this.studySessionService = studySessionService;
    }

    @PostMapping("/start")
    public ResponseEntity<ApiResponse<StudySessionResponse>> startSession(
            @Valid @RequestBody StudySessionStartRequest request,
            Principal principal
    ) {
        StudySessionResponse response = studySessionService.startSession(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Study session started successfully"));
    }

    @PostMapping("/{sessionId}/end")
    public ResponseEntity<ApiResponse<StudySessionResponse>> endSession(
            @PathVariable UUID sessionId,
            Principal principal
    ) {
        StudySessionResponse response = studySessionService.endSession(sessionId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Study session ended successfully"));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<StudySessionResponse>> getActiveSession(Principal principal) {
        StudySessionResponse active = studySessionService.getActiveSession(principal.getName());
        if (active == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(ApiResponse.success(active, "Active session retrieved"));
    }

    @GetMapping("/history")
    public ResponseEntity<ApiResponse<Page<StudySessionResponse>>> getSessionHistory(
            Principal principal,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) OffsetDateTime endDate,
            @RequestParam(required = false) String subject,
            Pageable pageable
    ) {
        Page<StudySessionResponse> history = studySessionService.getSessionHistory(
                principal.getName(), startDate, endDate, subject, pageable);
        return ResponseEntity.ok(ApiResponse.success(history, "Session history retrieved"));
    }
}
