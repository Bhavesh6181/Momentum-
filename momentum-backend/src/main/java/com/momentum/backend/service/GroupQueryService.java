package com.momentum.backend.service;

import com.momentum.backend.dto.response.GroupDetailsResponse;
import com.momentum.backend.dto.response.GroupResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface GroupQueryService {
    Page<GroupResponse> getMyGroups(String username, Pageable pageable);
    GroupDetailsResponse getGroupDetails(UUID groupId, String username);
}
