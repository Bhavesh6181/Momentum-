package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.GoalResponse;
import com.momentum.backend.entity.Goal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface GoalMapper {

    @Mapping(target = "userId",          source = "user.id")
    @Mapping(target = "groupId",         source = "group.id")
    @Mapping(target = "progressPercent", expression = "java(goal.getTargetValue() > 0 ? Math.min(100.0, (goal.getCurrentValue() / goal.getTargetValue()) * 100.0) : 0.0)")
    GoalResponse toResponse(Goal goal);
}
