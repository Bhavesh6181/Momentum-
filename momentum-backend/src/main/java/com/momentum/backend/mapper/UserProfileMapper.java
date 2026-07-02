package com.momentum.backend.mapper;

import com.momentum.backend.dto.request.UserProfileUpdateRequest;
import com.momentum.backend.dto.response.UserProfileResponse;
import com.momentum.backend.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface UserProfileMapper {

    UserProfileResponse toProfileResponse(UserProfile profile);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "profilePictureUrl", ignore = true)
    void updateProfileFromRequest(UserProfileUpdateRequest request, @MappingTarget UserProfile profile);
}
