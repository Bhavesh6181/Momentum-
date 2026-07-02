package com.momentum.backend.service.impl;

import com.momentum.backend.service.ProfilePictureService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Service
public class MockProfilePictureService implements ProfilePictureService {

    @Override
    public String uploadProfilePicture(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        String fileExtension = getFileExtension(file.getOriginalFilename());
        return "https://momentum-profiles-mock.s3.amazonaws.com/" + UUID.randomUUID() + fileExtension;
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
