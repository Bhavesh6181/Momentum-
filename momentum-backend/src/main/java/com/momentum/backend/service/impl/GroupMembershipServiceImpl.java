package com.momentum.backend.service.impl;

import com.momentum.backend.entity.*;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.event.GroupJoinedEvent;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.GroupMembershipService;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class GroupMembershipServiceImpl implements GroupMembershipService {

    private final GroupRepository groupRepository;
    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    public GroupMembershipServiceImpl(
            GroupRepository groupRepository,
            GroupMemberRepository groupMemberRepository,
            UserRepository userRepository,
            ApplicationEventPublisher eventPublisher
    ) {
        this.groupRepository = groupRepository;
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
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

        GroupMembershipStatus statusToAssign = GroupMembershipStatus.ACTIVE;
        if (group.isPrivate() && inviteCode == null) {
            statusToAssign = GroupMembershipStatus.PENDING;
        }

        GroupMember newMember = GroupMember.builder()
                .id(id)
                .group(group)
                .user(user)
                .role(GroupRole.MEMBER)
                .status(statusToAssign)
                .build();
        groupMemberRepository.save(newMember);

        if (statusToAssign == GroupMembershipStatus.ACTIVE) {
            eventPublisher.publishEvent(new GroupJoinedEvent(user.getId(), group.getId(), group.getName()));
        }
    }

    @Override
    @Transactional
    public void approveMember(UUID groupId, UUID userId) {
        GroupMemberId id = new GroupMemberId(groupId, userId);
        GroupMember member = groupMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Membership request not found"));

        if (member.getStatus() != GroupMembershipStatus.PENDING) {
            return; // Already active member
        }

        member.setStatus(GroupMembershipStatus.ACTIVE);
        groupMemberRepository.save(member);

        eventPublisher.publishEvent(new GroupJoinedEvent(userId, groupId, member.getGroup().getName()));
    }

    @Override
    @Transactional
    public void removeMember(UUID groupId, UUID userId) {
        GroupMemberId id = new GroupMemberId(groupId, userId);
        GroupMember member = groupMemberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Group member not found"));

        groupMemberRepository.delete(member);
    }
}
