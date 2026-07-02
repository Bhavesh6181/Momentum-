package com.momentum.backend.security;

import com.momentum.backend.entity.GroupMember;
import com.momentum.backend.entity.GroupMemberId;
import com.momentum.backend.enums.GroupRole;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.UserRepository;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Aspect
@Component
public class GroupSecurityAspect {

    private final GroupMemberRepository groupMemberRepository;
    private final UserRepository userRepository;

    public GroupSecurityAspect(GroupMemberRepository groupMemberRepository, UserRepository userRepository) {
        this.groupMemberRepository = groupMemberRepository;
        this.userRepository = userRepository;
    }

    @Before("@annotation(com.momentum.backend.security.GroupAdminOnly)")
    public void checkGroupAdmin(JoinPoint joinPoint) {
        if (SecurityContextHolder.getContext().getAuthentication() == null) {
            throw new AccessDeniedException("User not authenticated");
        }

        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        UUID groupId = null;
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String[] parameterNames = signature.getParameterNames();
        Object[] args = joinPoint.getArgs();

        if (parameterNames != null && args != null) {
            for (int i = 0; i < parameterNames.length; i++) {
                if ("groupId".equals(parameterNames[i]) && args[i] instanceof UUID) {
                    groupId = (UUID) args[i];
                    break;
                }
            }
        }

        if (groupId == null) {
            throw new IllegalArgumentException("Method annotated with @GroupAdminOnly must contain a UUID parameter named 'groupId'");
        }

        UUID userId = userRepository.findByUsername(currentUsername)
                .orElseThrow(() -> new AccessDeniedException("User not authenticated"))
                .getId();

        GroupMember member = groupMemberRepository.findById(new GroupMemberId(groupId, userId))
                .orElseThrow(() -> new AccessDeniedException("You are not a member of this group"));

        if (member.getRole() != GroupRole.ADMIN) {
            throw new AccessDeniedException("Only group administrators can perform this action");
        }
    }
}
