package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.UserProfilePublicResponse;
import com.momentum.backend.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserProfileMapper.class, UserStatsMapper.class})
public interface UserPublicMapper {

    @Mapping(target = "username", source = "username")
    @Mapping(target = "profile", source = "profile")
    @Mapping(target = "stats", source = "stats")
    UserProfilePublicResponse toPublicResponse(User user);
}
