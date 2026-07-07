package com.momentum.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {
    private String name;
    private String college;
    private String branch;
    private Integer graduationYear;
    private String profilePictureUrl;
    private List<String> skills;
    private String targetCompany;
    private String targetPackage;
    private String githubLink;
    private String linkedinLink;
    private String bio;
    private boolean onboardingCompleted;
    private int onboardingStep;
}
