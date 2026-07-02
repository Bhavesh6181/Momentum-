package com.momentum.backend.controller;

import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.dto.response.ApiResponse;
import com.momentum.backend.dto.response.UserMeResponse;
import com.momentum.backend.dto.response.UserProfilePublicResponse;
import com.momentum.backend.dto.response.UserStatsResponse;
import com.momentum.backend.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;

@RestController
@RequestMapping("/api/v1/users")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> getMyProfile(Principal principal) {
        UserMeResponse response = userProfileService.getMyProfile(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched profile successfully"));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserMeResponse>> updateMyProfile(
            @Valid @RequestBody UserProfileUpdateRequest request,
            Principal principal
    ) {
        UserMeResponse response = userProfileService.updateMyProfile(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success(response, "Profile updated successfully"));
    }

    @GetMapping("/{username}/public")
    public ResponseEntity<ApiResponse<UserProfilePublicResponse>> getPublicProfile(@PathVariable("username") String username) {
        UserProfilePublicResponse response = userProfileService.getPublicProfile(username);
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched public profile successfully"));
    }

    @PostMapping("/me/profile-picture")
    public ResponseEntity<ApiResponse<String>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            Principal principal
    ) {
        String url = userProfileService.uploadProfilePicture(principal.getName(), file);
        return ResponseEntity.ok(ApiResponse.success(url, "Profile picture uploaded successfully"));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<ApiResponse<UserStatsResponse>> getMyStats(Principal principal) {
        UserStatsResponse response = userProfileService.getMyStats(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response, "Fetched stats successfully"));
    }
}
