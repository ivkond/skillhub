package com.iflytek.skillhub.domain.collection;

import jakarta.persistence.*;
import java.time.Clock;
import java.time.Instant;

@Entity
@Table(
        name = "skill_collection_member",
        uniqueConstraints = @UniqueConstraint(columnNames = {"skill_collection_id", "skill_id"})
)
public class SkillCollectionMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "skill_collection_id", nullable = false)
    private Long collectionId;

    @Column(name = "skill_id", nullable = false)
    private Long skillId;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected SkillCollectionMember() {
    }

    public SkillCollectionMember(Long collectionId, Long skillId, Integer sortOrder) {
        this.collectionId = collectionId;
        this.skillId = skillId;
        this.sortOrder = sortOrder;
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

    public Long getSkillId() {
        return skillId;
    }

    public void setSkillId(Long skillId) {
        this.skillId = skillId;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
