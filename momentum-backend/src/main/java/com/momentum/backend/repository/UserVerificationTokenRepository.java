package com.momentum.backend.repository;

import com.momentum.backend.entity.UserVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserVerificationTokenRepository extends JpaRepository<UserVerificationToken, UUID> {
    Optional<UserVerificationToken> findByToken(String token);
    void deleteByUserId(UUID userId);
}
