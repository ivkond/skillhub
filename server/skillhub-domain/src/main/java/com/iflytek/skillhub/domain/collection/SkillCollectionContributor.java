package com.iflytek.skillhub.domain.collection;

import jakarta.persistence.*;
import java.time.Clock;
import java.time.Instant;

@Entity
@Table(
        name = "skill_collection_contributor",
        uniqueConstraints = @UniqueConstraint(columnNames = {"skill_collection_id", "user_id"})
)
public class SkillCollectionContributor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_collection_id", nullable = false)
    private Long collectionId;

    @Column(name = "user_id", nullable = false, length = 128)
    private String userId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SkillCollectionContributor() {
    }

    public SkillCollectionContributor(Long collectionId, String userId) {
        this.collectionId = collectionId;
        this.userId = userId;
    }

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now(Clock.systemUTC());
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now(Clock.systemUTC());
    }

    public Long getId() {
        return id;
    }

    public Long getCollectionId() {
        return collectionId;
    }

    public void setCollectionId(Long collectionId) {
        this.collectionId = collectionId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
