package com.momentum.backend.dto.response;

import lombok.*;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSummary {
    private UUID id;
    private String username;
    private String email;
    private String role;
}
