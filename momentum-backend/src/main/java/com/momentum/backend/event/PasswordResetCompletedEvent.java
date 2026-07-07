package com.momentum.backend.event;

import com.momentum.backend.entity.User;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class PasswordResetCompletedEvent {
    private final User user;
}
