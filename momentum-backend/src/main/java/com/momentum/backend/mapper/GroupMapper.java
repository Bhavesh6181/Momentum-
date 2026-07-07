package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.GroupDetailsResponse;
import com.momentum.backend.dto.response.GroupMemberResponse;
import com.momentum.backend.dto.response.GroupResponse;
import com.momentum.backend.entity.Group;
import com.momentum.backend.entity.GroupMember;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface GroupMapper {

    @Mapping(target = "createdBy", source = "createdBy.username")
    @Mapping(target = "memberCount", ignore = true)
    @Mapping(target = "isPrivate", source = "private")
    GroupResponse toResponse(Group group);

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "username", source = "user.username")
    GroupMemberResponse toMemberResponse(GroupMember member);

    List<GroupMemberResponse> toMemberResponseList(List<GroupMember> members);

    @Mapping(target = "createdBy", source = "createdBy.username")
    @Mapping(target = "memberCount", ignore = true)
    @Mapping(target = "members", ignore = true)
    @Mapping(target = "isPrivate", source = "private")
    GroupDetailsResponse toDetailsResponse(Group group);
}
