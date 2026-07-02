package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.dto.response.UserMeResponse;
import com.momentum.backend.dto.response.UserProfilePublicResponse;
import com.momentum.backend.dto.response.UserStatsResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import com.momentum.backend.event.UserProfilePictureChangedEvent;
import com.momentum.backend.event.UserProfileUpdatedEvent;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.mapper.UserProfileMapper;
import com.momentum.backend.mapper.UserMeMapper;
import com.momentum.backend.mapper.UserPublicMapper;
import com.momentum.backend.mapper.UserStatsMapper;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.ProfilePictureService;
import com.momentum.backend.service.UserProfileService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final ProfilePictureService profilePictureService;
    private final UserProfileMapper userProfileMapper;
    private final UserStatsMapper userStatsMapper;
    private final UserMeMapper userMeMapper;
    private final UserPublicMapper userPublicMapper;
    private final ApplicationEventPublisher eventPublisher;

    public UserProfileServiceImpl(
            UserRepository userRepository,
            ProfilePictureService profilePictureService,
            UserProfileMapper userProfileMapper,
            UserStatsMapper userStatsMapper,
            UserMeMapper userMeMapper,
            UserPublicMapper userPublicMapper,
            ApplicationEventPublisher eventPublisher
    ) {
        this.userRepository = userRepository;
        this.profilePictureService = profilePictureService;
        this.userProfileMapper = userProfileMapper;
        this.userStatsMapper = userStatsMapper;
        this.userMeMapper = userMeMapper;
        this.userPublicMapper = userPublicMapper;
        this.eventPublisher = eventPublisher;
    }

    @Override
    @Transactional(readOnly = true)
    public UserMeResponse getMyProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        
        initializeProfileAndStatsIfNull(user);
        
        return userMeMapper.toMeResponse(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "publicProfiles", key = "#username")
    public UserMeResponse updateMyProfile(String username, UserProfileUpdateRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        UserProfile profile = user.getProfile();
        if (request.getVersion() != null && !request.getVersion().equals(profile.getVersion())) {
            throw new org.springframework.orm.ObjectOptimisticLockingFailureException(UserProfile.class, profile.getId());
        }

        userProfileMapper.updateProfileFromRequest(request, profile);
        userRepository.save(user);

        // Publish event for auditing and downstream consumers
        eventPublisher.publishEvent(new UserProfileUpdatedEvent(username));

        return userMeMapper.toMeResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "publicProfiles", key = "#username")
    public UserProfilePublicResponse getPublicProfile(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        return userPublicMapper.toPublicResponse(user);
    }

    @Override
    @Transactional
    @CacheEvict(value = "publicProfiles", key = "#username")
    public String uploadProfilePicture(String username, MultipartFile file) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        String imageUrl = profilePictureService.uploadProfilePicture(file);
        user.getProfile().setProfilePictureUrl(imageUrl);
        userRepository.save(user);

        // Publish event for picture change auditing
        eventPublisher.publishEvent(new UserProfilePictureChangedEvent(username, imageUrl));

        return imageUrl;
    }

    @Override
    @Transactional(readOnly = true)
    public UserStatsResponse getMyStats(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));

        initializeProfileAndStatsIfNull(user);

        return userStatsMapper.toStatsResponse(user.getStats());
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
