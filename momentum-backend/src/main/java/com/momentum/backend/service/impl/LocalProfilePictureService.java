package com.momentum.backend.service.impl;

import com.momentum.backend.exception.ValidationException;
import com.momentum.backend.service.ProfilePictureService;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class LocalProfilePictureService implements ProfilePictureService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

    @Override
    public String uploadProfilePicture(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ValidationException("File cannot be empty");
        }

        // Validate maximum size
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ValidationException("File size must not exceed 5MB");
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ValidationException("Only image files are allowed");
        }

        // Extract original extension
        String extension = getFileExtension(file.getOriginalFilename());
        String filename = UUID.randomUUID().toString() + extension;

        try {
            Path targetDir = Paths.get("uploads/profile-pictures").toAbsolutePath();
            if (!Files.exists(targetDir)) {
                Files.createDirectories(targetDir);
            }

            Path targetPath = targetDir.resolve(filename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            return ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/uploads/profile-pictures/")
                    .path(filename)
                    .toUriString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to save profile picture locally", e);
        }
    }

    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return ".png";
        }
        return filename.substring(filename.lastIndexOf("."));
    }
}
