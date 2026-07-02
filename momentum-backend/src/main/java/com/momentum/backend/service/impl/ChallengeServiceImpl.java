package com.momentum.backend.service.impl;

import com.momentum.backend.dto.request.ChallengeCreateRequest;
import com.momentum.backend.dto.request.GoalProgressRequest;
import com.momentum.backend.dto.response.ChallengeParticipantResponse;
import com.momentum.backend.dto.response.ChallengeResponse;
import com.momentum.backend.entity.*;
import com.momentum.backend.enums.ChallengeStatus;
import com.momentum.backend.exception.ResourceNotFoundException;
import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.mapper.ChallengeMapper;
import com.momentum.backend.repository.ChallengeParticipantRepository;
import com.momentum.backend.repository.ChallengeRepository;
import com.momentum.backend.repository.GroupRepository;
import com.momentum.backend.repository.UserRepository;
import com.momentum.backend.service.ChallengeService;
import com.momentum.backend.util.GroupAdminGuard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class ChallengeServiceImpl implements ChallengeService {

    private final ChallengeRepository challengeRepository;
    private final ChallengeParticipantRepository participantRepository;
    private final GroupRepository groupRepository;
    private final UserRepository userRepository;
    private final GroupAdminGuard groupAdminGuard;
    private final ChallengeMapper challengeMapper;

    public ChallengeServiceImpl(
            ChallengeRepository challengeRepository,
            ChallengeParticipantRepository participantRepository,
            GroupRepository groupRepository,
            UserRepository userRepository,
            GroupAdminGuard groupAdminGuard,
            ChallengeMapper challengeMapper
    ) {
        this.challengeRepository = challengeRepository;
        this.participantRepository = participantRepository;
        this.groupRepository = groupRepository;
        this.userRepository = userRepository;
        this.groupAdminGuard = groupAdminGuard;
        this.challengeMapper = challengeMapper;
    }

    @Override
    @Transactional
    public ChallengeResponse createChallenge(UUID groupId, String username, ChallengeCreateRequest request) {
        User creator = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new ResourceNotFoundException("Group not found: " + groupId));

        // Only group admins can create challenges
        groupAdminGuard.assertIsAdmin(groupId, creator.getId());

        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new ValidationException("End date must be after or equal to start date");
        }

        Challenge challenge = Challenge.builder()
                .group(group)
                .createdBy(creator)
                .title(request.getTitle())
                .description(request.getDescription())
                .targetValue(request.getTargetValue())
                .unit(request.getUnit())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .status(ChallengeStatus.OPEN)
                .build();

        return challengeMapper.toResponse(challengeRepository.save(challenge));
    }

    @Override
    @Transactional
    public ChallengeParticipantResponse joinChallenge(UUID challengeId, String username) {
        Challenge challenge = challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + challengeId));

        if (challenge.getStatus() == ChallengeStatus.CLOSED) {
            throw new ValidationException("Cannot join a closed challenge");
        }

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        ChallengeParticipantId participantId = new ChallengeParticipantId(challengeId, user.getId());

        // Idempotent — return existing participant row if already joined
        return participantRepository.findById(participantId)
                .map(challengeMapper::toParticipantResponse)
                .orElseGet(() -> {
                    ChallengeParticipant participant = ChallengeParticipant.builder()
                            .id(participantId)
                            .challenge(challenge)
                            .user(user)
                            .currentProgress(0.0)
                            .build();
                    return challengeMapper.toParticipantResponse(participantRepository.save(participant));
                });
    }

    @Override
    @Transactional
    public ChallengeParticipantResponse updateProgress(UUID challengeId, String username, GoalProgressRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        ChallengeParticipantId participantId = new ChallengeParticipantId(challengeId, user.getId());
        ChallengeParticipant participant = participantRepository.findById(participantId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "You are not a participant in this challenge. Join first."));

        Challenge challenge = participant.getChallenge();
        if (challenge.getStatus() == ChallengeStatus.CLOSED) {
            throw new ValidationException("Cannot update progress on a closed challenge");
        }

        participant.setCurrentProgress(request.getValue());
        return challengeMapper.toParticipantResponse(participantRepository.save(participant));
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ChallengeParticipantResponse> getLeaderboard(UUID challengeId, Pageable pageable) {
        challengeRepository.findById(challengeId)
                .orElseThrow(() -> new ResourceNotFoundException("Challenge not found: " + challengeId));

        return participantRepository.findLeaderboard(challengeId, pageable)
                .map(challengeMapper::toParticipantResponse);
    }
}
