package com.momentum.backend.mapper;

import com.momentum.backend.dto.response.UserMeResponse;
import com.momentum.backend.entity.User;
import com.momentum.backend.entity.UserProfile;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring", uses = {UserProfileMapper.class, UserStatsMapper.class})
public interface UserMeMapper {

    @Mapping(target = "profileCompletion", expression = "java(calculateCompletion(user.getProfile()))")
    UserMeResponse toMeResponse(User user);

    default int calculateCompletion(UserProfile profile) {
        if (profile == null) {
            return 0;
        }
        int totalFields = 11;
        int filledFields = 0;
        if (profile.getName() != null && !profile.getName().isBlank()) filledFields++;
        if (profile.getCollege() != null && !profile.getCollege().isBlank()) filledFields++;
        if (profile.getBranch() != null && !profile.getBranch().isBlank()) filledFields++;
        if (profile.getGraduationYear() != null) filledFields++;
        if (profile.getSkills() != null && !profile.getSkills().isEmpty()) filledFields++;
        if (profile.getTargetCompany() != null && !profile.getTargetCompany().isBlank()) filledFields++;
        if (profile.getTargetPackage() != null && !profile.getTargetPackage().isBlank()) filledFields++;
        if (profile.getGithubLink() != null && !profile.getGithubLink().isBlank()) filledFields++;
        if (profile.getLinkedinLink() != null && !profile.getLinkedinLink().isBlank()) filledFields++;
        if (profile.getBio() != null && !profile.getBio().isBlank()) filledFields++;
        if (profile.getProfilePictureUrl() != null && !profile.getProfilePictureUrl().isBlank()) filledFields++;

        return (int) Math.round((double) filledFields * 100 / totalFields);
    }
}
