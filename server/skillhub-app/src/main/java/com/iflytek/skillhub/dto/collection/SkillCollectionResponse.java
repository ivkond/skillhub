package com.iflytek.skillhub.dto.collection;

import com.iflytek.skillhub.domain.collection.SkillCollection;
import java.time.Instant;

public record SkillCollectionResponse(
        Long id,
        String ownerId,
        String slug,
        String title,
        String description,
        String visibility,
        Instant createdAt,
        Instant updatedAt
) {
    public static SkillCollectionResponse from(SkillCollection collection) {
        return new SkillCollectionResponse(
                collection.getId(),
                collection.getOwnerId(),
                collection.getSlug(),
                collection.getTitle(),
                collection.getDescription(),
                collection.getVisibility().name(),
                collection.getCreatedAt(),
                collection.getUpdatedAt()
        );
    }
}
