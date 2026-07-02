package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.ChallengeParticipantResponse;
import com.momentum.backend.dto.response.ChallengeResponse;
import com.momentum.backend.entity.Challenge;
import com.momentum.backend.entity.ChallengeParticipant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ChallengeMapper {

    @Mapping(target = "groupId",     source = "group.id")
    @Mapping(target = "createdById", source = "createdBy.id")
    ChallengeResponse toResponse(Challenge challenge);

    @Mapping(target = "userId",   source = "user.id")
    @Mapping(target = "username", source = "user.username")
    ChallengeParticipantResponse toParticipantResponse(ChallengeParticipant participant);
}
