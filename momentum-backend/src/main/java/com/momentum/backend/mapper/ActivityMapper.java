package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.ActivityResponse;
import com.momentum.backend.entity.Activity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ActivityMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    @Mapping(target = "groupId", source = "group.id")
    ActivityResponse toResponse(Activity activity);
}
