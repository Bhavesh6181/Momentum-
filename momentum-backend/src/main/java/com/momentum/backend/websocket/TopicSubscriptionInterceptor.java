package com.momentum.backend.websocket;

import com.momentum.backend.entity.User;
import com.momentum.backend.entity.GroupMemberId;
import com.momentum.backend.enums.GroupMembershipStatus;
import com.momentum.backend.repository.GroupMemberRepository;
import com.momentum.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.MessageDeliveryException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;

import java.security.Principal;
import java.util.Collections;
import java.util.UUID;

@Component
@Slf4j
public class TopicSubscriptionInterceptor implements ChannelInterceptor {

    private final UserRepository userRepository;
    private final GroupMemberRepository groupMemberRepository;

    public TopicSubscriptionInterceptor(UserRepository userRepository, GroupMemberRepository groupMemberRepository) {
        this.userRepository = userRepository;
        this.groupMemberRepository = groupMemberRepository;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        
        if (accessor != null) {
            StompCommand command = accessor.getCommand();
            
            if (StompCommand.CONNECT.equals(command)) {
                String username = (String) accessor.getSessionAttributes().get("username");
                if (username != null) {
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            Collections.singletonList(new SimpleGrantedAuthority("ROLE_USER"))
                    );
                    accessor.setUser(auth);
                    log.info("Associated Principal with STOMP session for user: {}", username);
                }
            } else if (StompCommand.SUBSCRIBE.equals(command)) {
                String destination = accessor.getDestination();
                Principal principal = accessor.getUser();
                String username = principal != null ? principal.getName() : (String) accessor.getSessionAttributes().get("username");

                if (username == null) {
                    log.warn("Subscription rejected: Unauthenticated");
                    throw new MessageDeliveryException("Unauthorized: No authenticated user");
                }

                // Check group topic permissions
                if (destination != null && destination.startsWith("/topic/group/")) {
                    String[] parts = destination.split("/");
                    if (parts.length >= 4) {
                        try {
                            UUID groupId = UUID.fromString(parts[3]);
                            
                            User user = userRepository.findByUsername(username)
                                    .orElseThrow(() -> new MessageDeliveryException("User not found"));
                            
                            GroupMemberId memberId = new GroupMemberId(groupId, user.getId());
                            boolean isMember = groupMemberRepository.findById(memberId)
                                    .map(gm -> gm.getStatus() == GroupMembershipStatus.ACTIVE)
                                    .orElse(false);
                            
                            if (!isMember) {
                                log.warn("Subscription to {} rejected for user {}: Not a member of the group", destination, username);
                                throw new MessageDeliveryException("Unauthorized: You are not an active member of this group");
                            }
                            
                            log.info("Subscription to {} approved for user {}", destination, username);
                        } catch (IllegalArgumentException e) {
                            throw new MessageDeliveryException("Invalid group ID in subscription destination");
                        }
                    }
                }
            }
        }
        
        return message;
    }
}
