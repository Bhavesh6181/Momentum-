package com.momentum.backend.service;

import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.dto.response.UserMeResponse;
import com.momentum.backend.dto.response.UserProfilePublicResponse;
import com.momentum.backend.dto.response.UserStatsResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UserProfileService {
    UserMeResponse getMyProfile(String username);
    UserMeResponse updateMyProfile(String username, UserProfileUpdateRequest request);
    UserProfilePublicResponse getPublicProfile(String username);
    String uploadProfilePicture(String username, MultipartFile file);
    UserStatsResponse getMyStats(String username);
}
