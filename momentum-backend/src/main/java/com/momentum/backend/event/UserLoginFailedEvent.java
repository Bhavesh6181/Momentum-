package com.momentum.backend.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserLoginFailedEvent {
    private final String username;
    private final String ipAddress;
    private final String userAgent;
}
