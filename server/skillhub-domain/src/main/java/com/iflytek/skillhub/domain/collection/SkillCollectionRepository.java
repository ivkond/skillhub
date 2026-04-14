package com.iflytek.skillhub.domain.collection;

import java.util.Optional;

/**
 * Domain repository contract for persisted skill collection aggregates.
 */
public interface SkillCollectionRepository {

    Optional<SkillCollection> findById(Long id);

    long countByOwnerId(String ownerId);

    boolean existsByOwnerIdAndSlug(String ownerId, String slug);

    boolean existsByOwnerIdAndSlugAndIdNot(String ownerId, String slug, Long id);

    SkillCollection save(SkillCollection collection);

    void delete(SkillCollection collection);
}
