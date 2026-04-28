package com.iflytek.skillhub.dto.collection;

import com.iflytek.skillhub.domain.collection.SkillCollectionContributor;
import java.time.Instant;

public record SkillCollectionContributorResponse(
        String userId,
        Instant createdAt,
        Instant updatedAt
) {
    public static SkillCollectionContributorResponse from(SkillCollectionContributor contributor) {
        return new SkillCollectionContributorResponse(
                contributor.getUserId(),
                contributor.getCreatedAt(),
                contributor.getUpdatedAt()
        );
    }
}
