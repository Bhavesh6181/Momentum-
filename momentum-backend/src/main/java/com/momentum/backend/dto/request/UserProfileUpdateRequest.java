package com.momentum.backend.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.validator.constraints.URL;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileUpdateRequest {

    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 150, message = "College name cannot exceed 150 characters")
    private String college;

    @Size(max = 100, message = "Branch name cannot exceed 100 characters")
    private String branch;

    @Min(value = 1900, message = "Graduation year must be after 1900")
    private Integer graduationYear;

    private List<String> skills;

    @Size(max = 100, message = "Target company cannot exceed 100 characters")
    private String targetCompany;

    @DecimalMin(value = "0.0", message = "Target package must be a positive numeric value")
    private String targetPackage;

    @URL(message = "GitHub link must be a valid URL")
    private String githubLink;

    @URL(message = "LinkedIn link must be a valid URL")
    private String linkedinLink;

    private String bio;

    private Boolean onboardingCompleted;

    private Integer onboardingStep;

    private Long version;
}
