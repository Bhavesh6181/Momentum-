package com.momentum.backend.event;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class UserProfilePictureChangedEvent {
    private final String username;
    private final String imageUrl;
}
