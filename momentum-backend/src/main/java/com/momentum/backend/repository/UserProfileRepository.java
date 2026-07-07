package com.momentum.backend.repository;

import com.momentum.backend.entity.UserProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, UUID> {
    Optional<UserProfile> findByUserId(UUID userId);
    List<UserProfile> findByTargetCompanyIgnoreCase(String targetCompany);
    List<UserProfile> findByCollegeIgnoreCase(String college);

    @Query("SELECT up FROM UserProfile up WHERE " +
           "(LOWER(up.name) LIKE LOWER(CONCAT('%', :query, '%'))) OR " +
           "(LOWER(up.user.username) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<UserProfile> searchUserProfiles(@Param("query") String query, Pageable pageable);
}
