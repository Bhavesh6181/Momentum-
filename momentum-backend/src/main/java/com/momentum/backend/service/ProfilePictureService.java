package com.momentum.backend.service;

import org.springframework.web.multipart.MultipartFile;

public interface ProfilePictureService {
    String uploadProfilePicture(MultipartFile file);
}
