package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.PomodoroSessionResponse;
import com.momentum.backend.entity.PomodoroSession;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PomodoroSessionMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "mode", expression = "java(session.getMode().getValue())")
    @Mapping(target = "currentTime", expression = "java(java.time.OffsetDateTime.now())")
    PomodoroSessionResponse toResponse(PomodoroSession session);
}
