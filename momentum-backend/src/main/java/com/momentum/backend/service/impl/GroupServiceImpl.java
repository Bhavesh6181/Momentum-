package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.GroupCreateRequest;
import com.momentum.backend.dto.request.GroupSettingsUpdateRequest;
import com.momentum.backend.dto.response.GroupDetailsResponse;
import com.momentum.backend.dto.response.GroupMemberResponse;
import com.momentum.backend.dto.response.GroupResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.mapper.GroupMapper;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.GroupService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupServiceImpl implements GroupService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupMapper groupMapper;

    private static final List<GroupRole> ACTIVE_ROLES = List.of(GroupRole.ADMIN, GroupRole.MEMBER);

    public GroupServiceImpl(
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

        // Generate unique 8-character invite code
        String inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        while (groupRepository.findByInviteCode(inviteCode).isPresent()) {
            inviteCode = UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }

        Group group = Group.builder()
                .name(request.getName())
                .description(request.getDescription())
                .isPrivate(request.isPrivate())
                .inviteCode(inviteCode)
                .createdBy(creator)
                .build();

        Group savedGroup = groupRepository.save(group);

        // Add creator as ADMIN automatically
        GroupMember member = GroupMember.builder()
                .id(new GroupMemberId(savedGroup.getId(), creator.getId()))
                .group(savedGroup)
                .user(creator)
                .role(GroupRole.ADMIN)
                .build();
        groupMemberRepository.save(member);

        GroupResponse response = groupMapper.toResponse(savedGroup);
        response.setMemberCount(1);
        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<GroupResponse> getMyGroups(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Page<Group> joinedGroups = groupRepository.findJoinedGroups(user.getId(), pageable);

        return joinedGroups.map(g -> {
            GroupResponse response = groupMapper.toResponse(g);
            int activeMembers = groupMemberRepository.countByGroupIdAndRoleIn(g.getId(), ACTIVE_ROLES);
            response.setMemberCount(activeMembers);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    public GroupDetailsResponse getGroupDetails(UUID groupId, String username) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        GroupMember currentMember = groupMemberRepository.findById(new GroupMemberId(groupId, user.getId()))
                .orElse(null);

        boolean isActiveMember = currentMember != null && ACTIVE_ROLES.contains(currentMember.getRole());

        // Restrict details for private groups to non-members
        if (group.isPrivate() && !isActiveMember) {
            throw new AccessDeniedException("Access denied. This is a private group.");
        }

        GroupDetailsResponse response = groupMapper.toDetailsResponse(group);
        int activeMembers = groupMemberRepository.countByGroupIdAndRoleIn(groupId, ACTIVE_ROLES);
        response.setMemberCount(activeMembers);

        // Retrieve membership list
        List<GroupMember> allMembers = groupMemberRepository.findByGroupId(groupId);

        // Admins can see PENDING requests; others only see active members
        boolean isAdmin = currentMember != null && currentMember.getRole() == GroupRole.ADMIN;
        List<GroupMember> visibleMembers = allMembers.stream()
                .filter(m -> isAdmin || ACTIVE_ROLES.contains(m.getRole()))
                .collect(Collectors.toList());

        List<GroupMemberResponse> membersResponseList = visibleMembers.stream()
                .map(groupMapper::toMemberResponse)
                .collect(Collectors.toList());

        response.setMembers(membersResponseList);
        return response;
    }

    @Override
    @Transactional
    public void joinGroup(UUID groupId, String username, String inviteCode) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        GroupMemberId id = new GroupMemberId(groupId, user.getId());
        if (groupMemberRepository.existsById(id)) {
            return; // Already a member or pending
        }

        if (inviteCode != null && !inviteCode.equalsIgnoreCase(group.getInviteCode())) {
            throw new ValidationException("Invalid invite code");
        }

        GroupRole roleToAssign = GroupRole.MEMBER;
        if (group.isPrivate() && inviteCode == null) {
            roleToAssign = GroupRole.PENDING;
        }

        GroupMember newMember = GroupMember.builder()
                .id(id)
                .group(group)
                .user(user)
                .role(roleToAssign)
                .build();
        groupMemberRepository.save(newMember);
    }

    @Override
    @Transactional
    public void approveMember(UUID groupId, UUID userId) {
        GroupMemberId id = new GroupMemberId(groupId, userId);
        GroupMember member = groupMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        if (member.getRole() != GroupRole.PENDING) {
            return; // Already active member
        }

        member.setRole(GroupRole.MEMBER);
        groupMemberRepository.save(member);
    }

    @Override
    @Transactional
    public void removeMember(UUID groupId, UUID userId) {
        GroupMemberId id = new GroupMemberId(groupId, userId);
        GroupMember member = groupMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group member not found"));

        // Delete membership
        groupMemberRepository.delete(member);
    }

    @Override
    @Transactional
    public GroupResponse updateSettings(UUID groupId, GroupSettingsUpdateRequest request) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        group.setName(request.getName());
        group.setDescription(request.getDescription());
        group.setPrivate(request.isPrivate());

        Group updatedGroup = groupRepository.save(group);
        GroupResponse response = groupMapper.toResponse(updatedGroup);
        int activeMembers = groupMemberRepository.countByGroupIdAndRoleIn(groupId, ACTIVE_ROLES);
        response.setMemberCount(activeMembers);
        return response;
    }

    @Override
    @Transactional
    public void deleteGroup(UUID groupId) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        groupRepository.delete(group);
    }
}
