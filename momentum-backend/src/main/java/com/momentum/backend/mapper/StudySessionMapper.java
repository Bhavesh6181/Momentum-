package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.StudySessionResponse;
import com.momentum.backend.entity.StudySession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface StudySessionMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "groupId", source = "group.id")
    @Mapping(target = "currentTime", expression = "java(java.time.OffsetDateTime.now())")
    StudySessionResponse toResponse(StudySession session);
}
