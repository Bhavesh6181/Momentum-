package com.momentum.backend.dto.request;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GroupJoinRequest {
    private String inviteCode;
}
