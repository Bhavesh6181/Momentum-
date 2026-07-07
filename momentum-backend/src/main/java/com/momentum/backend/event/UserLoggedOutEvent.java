package com.momentum.backend.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserLoggedOutEvent {
    private final String username;
}
