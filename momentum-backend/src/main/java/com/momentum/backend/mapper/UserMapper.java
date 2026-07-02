package com.momentum.backend.mapper;

import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.dto.response.UserProfilePublicResponse;
import com.momentum.backend.dto.response.UserProfileResponse;
import com.momentum.backend.dto.response.UserStatsResponse;
import com.momentum.backend.dto.response.UserMeResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import com.momentum.backend.entity.UserStats;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserMeResponse toMeResponse(User user);

    UserProfileResponse toProfileResponse(UserProfile profile);

    UserStatsResponse toStatsResponse(UserStats stats);

    @Mapping(target = "username", source = "username")
    @Mapping(target = "profile", source = "profile")
    @Mapping(target = "stats", source = "stats")
    UserProfilePublicResponse toPublicResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "profilePictureUrl", ignore = true)
    void updateProfileFromRequest(UserProfileUpdateRequest request, @MappingTarget UserProfile profile);
}
