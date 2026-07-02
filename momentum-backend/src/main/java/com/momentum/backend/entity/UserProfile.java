package com.momentum.backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
    name = "user_profiles",
    indexes = {
        @Index(name = "uq_user_profiles_user_id", columnList = "user_id", unique = true)
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString(exclude = "user")
@EqualsAndHashCode(exclude = "user")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Size(max = 100)
    @Column(length = 100)
    private String name;

    @Size(max = 150)
    @Column(length = 150)
    private String college;

    @Size(max = 100)
    @Column(length = 100)
    private String branch;

    @Column(name = "graduation_year")
    private Integer graduationYear;

    @Size(max = 255)
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills", columnDefinition = "jsonb")
    @Builder.Default
    private List<String> skills = new ArrayList<>();

    @Size(max = 100)
    @Column(name = "target_company", length = 100)
    private String targetCompany;

    @Size(max = 50)
    @Column(name = "target_package", length = 50)
    private String targetPackage;

    @Size(max = 255)
    @Column(name = "github_link")
    private String githubLink;

    @Size(max = 255)
    @Column(name = "linkedin_link")
    private String linkedinLink;

    @Column(columnDefinition = "text")
    private String bio;
}
