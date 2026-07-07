package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.GroupCreateRequest;
import com.momentum.backend.dto.request.GroupSettingsUpdateRequest;
import com.momentum.backend.dto.response.GroupResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.mapper.GroupMapper;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.GroupLifecycleService;
import com.momentum.backend.util.Base62Generator;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GroupLifecycleServiceImpl implements GroupLifecycleService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupMapper groupMapper;

    public GroupLifecycleServiceImpl(
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository,
            GroupMapper groupMapper
    ) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.groupMapper = groupMapper;
    }

    @Override
    @Transactional
    public GroupResponse createGroup(String username, GroupCreateRequest request) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        // Generate cryptographically secure Base62 8-character invite code
        String inviteCode = Base62Generator.generateCode(8);
        while (groupRepository.findByInviteCode(inviteCode).isPresent()) {
            inviteCode = Base62Generator.generateCode(8);
        }

        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isPrivate(request.isPrivate())
                .inviteCode(inviteCode)
                .createdBy(creator)
                .build();

        Group savedGroup = groupRepository.save(group);

        // Add creator as ADMIN with ACTIVE status
        GroupMember member = GroupMember.builder()
                .id(new GroupMemberId(savedGroup.getId(), creator.getId()))
                .group(savedGroup)
                .user(creator)
                .role(GroupRole.ADMIN)
                .status(GroupMembershipStatus.ACTIVE)
                .build();
        groupMemberRepository.save(member);

        GroupResponse response = groupMapper.toResponse(savedGroup);
        response.setMemberCount(1);
        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = "groupDetails", key = "#groupId")
    public GroupResponse updateSettings(UUID groupId, GroupSettingsUpdateRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setPrivate(request.isPrivate());

        Group updatedGroup = groupRepository.save(group);
        GroupResponse response = groupMapper.toResponse(updatedGroup);
        int activeMembers = groupMemberRepository.countByGroupIdAndStatus(groupId, GroupMembershipStatus.ACTIVE);
        response.setMemberCount(activeMembers);
        return response;
    }

    @Override
    @Transactional
    @CacheEvict(value = "groupDetails", key = "#groupId")
    public void deleteGroup(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        groupRepository.delete(group);
    }
}
