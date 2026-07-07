package com.momentum.backend.service.impl;

import com.momentum.backend.dto.response.GroupDetailsResponse;
import com.momentum.backend.dto.response.GroupMemberResponse;
import com.momentum.backend.dto.response.GroupResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.mapper.GroupMapper;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.GroupQueryService;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class GroupQueryServiceImpl implements GroupQueryService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final GroupMapper groupMapper;

    public GroupQueryServiceImpl(
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
    @Transactional(readOnly = true)
    public Page<GroupResponse> getMyGroups(String username, Pageable pageable) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Page<Group> joinedGroups = groupRepository.findJoinedGroups(user.getId(), pageable);
        List<Group> content = joinedGroups.getContent();

        if (content.isEmpty()) {
            return Page.empty(pageable);
        }

        List<UUID> groupIds = content.stream()
                .map(Group::getId)
                .collect(Collectors.toList());

        // Performance Optimization: Prevent N+1 count queries by querying counts in bulk
        List<Object[]> rawCounts = groupMemberRepository.countMembersByGroupIds(groupIds);
        Map<UUID, Long> countMap = rawCounts.stream()
                .collect(Collectors.toMap(
                        row -> (UUID) row[0],
                        row -> (Long) row[1]
                ));

        return joinedGroups.map(g -> {
            GroupResponse response = groupMapper.toResponse(g);
            int count = countMap.getOrDefault(g.getId(), 0L).intValue();
            response.setMemberCount(count);
            return response;
        });
    }

    @Override
    @Transactional(readOnly = true)
    @Cacheable(value = "groupDetails", key = "#groupId")
    public GroupDetailsResponse getGroupDetails(UUID groupId, String username) {
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found with ID: " + groupId));

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        GroupMember currentMember = groupMemberRepository.findById(new GroupMemberId(groupId, user.getId()))
                .orElse(null);

        boolean isActiveMember = currentMember != null && currentMember.getStatus() == GroupMembershipStatus.ACTIVE;

        if (group.isPrivate() && !isActiveMember) {
            throw new AccessDeniedException("Access denied. This is a private group.");
        }

        GroupDetailsResponse response = groupMapper.toDetailsResponse(group);
        int activeMembers = groupMemberRepository.countByGroupIdAndStatus(groupId, GroupMembershipStatus.ACTIVE);
        response.setMemberCount(activeMembers);

        // Performance Optimization: Use JOIN FETCH to load User details in a single query
        List<GroupMember> allMembers = groupMemberRepository.findByGroupIdWithUser(groupId);

        boolean isAdmin = currentMember != null && currentMember.getRole() == GroupRole.ADMIN && currentMember.getStatus() == GroupMembershipStatus.ACTIVE;
        List<GroupMember> visibleMembers = allMembers.stream()
                .filter(m -> isAdmin || m.getStatus() == GroupMembershipStatus.ACTIVE)
                .collect(Collectors.toList());

        List<GroupMemberResponse> membersResponseList = visibleMembers.stream()
                .map(groupMapper::toMemberResponse)
                .collect(Collectors.toList());

        response.setMembers(membersResponseList);
        return response;
    }
}
