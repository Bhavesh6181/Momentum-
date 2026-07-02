package com.momentum.backend.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserProfileUpdatedEvent {
    private final String username;
}
