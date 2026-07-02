package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.dto.response.UserMeResponse;
import com.momentum.backend.dto.response.UserProfilePublicResponse;
import com.momentum.backend.dto.response.UserStatsResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.mapper.UserMapper;
import com.momentum.backend.repository.UserProfileRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.ProfilePictureService;
import com.momentum.backend.service.UserProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final ProfilePictureService profilePictureService;
    private final UserMapper userMapper;

    public UserProfileServiceImpl(
            UserRepository userRepository,
            UserProfileRepository userProfileRepository,
            ProfilePictureService profilePictureService,
            UserMapper userMapper
    ) {
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.profilePictureService = profilePictureService;
        this.userMapper = userMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public UserMeResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        initializeProfileAndStatsIfNull(user);
        
        return userMapper.toMeResponse(user);
    }

    @Override
    @Transactional
    public UserMeResponse updateMyProfile(String username, UserProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        userMapper.updateProfileFromRequest(request, user.getProfile());
        userRepository.save(user);

        return userMapper.toMeResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfilePublicResponse getPublicProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        return userMapper.toPublicResponse(user);
    }

    @Override
    @Transactional
    public String uploadProfilePicture(String username, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        String imageUrl = profilePictureService.uploadProfilePicture(file);
        user.getProfile().setProfilePictureUrl(imageUrl);
        userRepository.save(user);

        return imageUrl;
    }

    @Override
    @Transactional(readOnly = true)
    public UserStatsResponse getMyStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        return userMapper.toStatsResponse(user.getStats());
    }

    private void initializeProfileAndStatsIfNull(User user) {
        boolean updated = false;
        if (user.getProfile() == null) {
            user.setProfile(UserProfile.builder().user(user).build());
            updated = true;
        }
        if (user.getStats() == null) {
            user.setStats(UserStats.builder().user(user).build());
            updated = true;
        }
        if (updated) {
            userRepository.save(user);
        }
    }
}
