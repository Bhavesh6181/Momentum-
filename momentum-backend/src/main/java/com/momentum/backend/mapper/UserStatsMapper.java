package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.UserStatsResponse;
import com.momentum.backend.entity.UserStats;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface UserStatsMapper {
    UserStatsResponse toStatsResponse(UserStats stats);
}
