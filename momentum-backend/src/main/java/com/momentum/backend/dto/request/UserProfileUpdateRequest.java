package com.momentum.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

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

    @Pattern(regexp = "^(0*[1-9]\\d*(\\.\\d+)?|0+\\.\\d*[1-9]\\d*)$", message = "Target package must be a positive numeric value")
    private String targetPackage;

    @Pattern(regexp = "^(https?://)?(www\\.)?github\\.com/[A-Za-z0-9_.-]+/?$", message = "Invalid GitHub profile link")
    private String githubLink;

    @Pattern(regexp = "^(https?://)?(www\\.)?linkedin\\.com/in/[A-Za-z0-9_.-]+/?$", message = "Invalid LinkedIn profile link")
    private String linkedinLink;

    private String bio;
}
