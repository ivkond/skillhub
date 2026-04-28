package com.iflytek.skillhub.domain.collection;

import com.iflytek.skillhub.domain.shared.exception.DomainBadRequestException;
import com.iflytek.skillhub.domain.skill.SkillVisibility;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * CRUD and metadata updates for skill collection aggregates (Phase 1 — no HTTP).
 */
@Service
public class SkillCollectionDomainService {

    private final SkillCollectionRepository skillCollectionRepository;
    private final SkillCollectionContributorRepository contributorRepository;
    private final SkillCollectionAuthorizationPolicy authorizationPolicy;

    public SkillCollectionDomainService(SkillCollectionRepository skillCollectionRepository,
                                        SkillCollectionContributorRepository contributorRepository,
                                        SkillCollectionAuthorizationPolicy authorizationPolicy) {
        this.skillCollectionRepository = skillCollectionRepository;
        this.contributorRepository = contributorRepository;
        this.authorizationPolicy = authorizationPolicy;
    }

    @Transactional
    public SkillCollection createCollection(String actingUserId,
                                            String title,
                                            String description,
                                            SkillVisibility visibility,
                                            String slug,
                                            boolean adminEquivalent,
                                            String targetOwnerId) {
        if (adminEquivalent) {
            authorizationPolicy.checkAllowed(false, false, true,
                    SkillCollectionAuthorizationPolicy.CollectionOperation.CREATE_COLLECTION);
        } else {
            authorizationPolicy.checkAllowed(true, false, false,
                    SkillCollectionAuthorizationPolicy.CollectionOperation.CREATE_COLLECTION);
        }
        SkillCollectionVisibilities.requireAllowed(visibility);
        if (title == null || title.trim().isEmpty()) {
            throw new DomainBadRequestException("error.skillCollection.title.blank");
        }
        String ownerId = adminEquivalent
                ? (targetOwnerId != null && !targetOwnerId.isBlank() ? targetOwnerId.trim() : actingUserId)
                : actingUserId;
        if (skillCollectionRepository.countByOwnerId(ownerId) >= SkillCollectionLimits.MAX_COLLECTIONS_PER_OWNER) {
            throw new DomainBadRequestException("error.skillCollection.cap.collectionsPerOwner");
        }
        String normalizedSlug = SkillCollectionSlugs.normalizeAndValidate(slug);
        if (skillCollectionRepository.existsByOwnerIdAndSlug(ownerId, normalizedSlug)) {
            throw new DomainBadRequestException("error.skillCollection.slug.duplicate", normalizedSlug);
        }
        SkillCollection created = new SkillCollection(ownerId, normalizedSlug, title.trim(), visibility);
        if (description != null && !description.isEmpty()) {
            created.setDescription(description.trim());
        }
        return skillCollectionRepository.save(created);
    }

    @Transactional
    public SkillCollection updateMetadata(Long collectionId,
                                          String actingUserId,
                                          String title,
                                          String description,
                                          String newSlugOrNull,
                                          boolean adminEquivalent) {
        SkillCollection collection = requireCollection(collectionId);
        boolean owner = collection.getOwnerId().equals(actingUserId);
        boolean contributor = !owner
                && contributorRepository.existsByCollectionIdAndUserId(collectionId, actingUserId);
        authorizationPolicy.checkAllowed(owner, contributor, adminEquivalent,
                SkillCollectionAuthorizationPolicy.CollectionOperation.UPDATE_METADATA);
        if (title == null || title.trim().isEmpty()) {
            throw new DomainBadRequestException("error.skillCollection.title.blank");
        }
        collection.setTitle(title.trim());
        if (description == null) {
            collection.setDescription(null);
        } else {
            collection.setDescription(description.trim().isEmpty() ? null : description.trim());
        }
        if (newSlugOrNull != null && !newSlugOrNull.isBlank()) {
            String normalized = SkillCollectionSlugs.normalizeAndValidate(newSlugOrNull);
            if (!normalized.equals(collection.getSlug())) {
                if (skillCollectionRepository.existsByOwnerIdAndSlugAndIdNot(
                        collection.getOwnerId(), normalized, collection.getId())) {
                    throw new DomainBadRequestException("error.skillCollection.slug.duplicate", normalized);
                }
                collection.setSlug(normalized);
            }
        }
        return skillCollectionRepository.save(collection);
    }

    @Transactional
    public SkillCollection setVisibility(Long collectionId,
                                         String actingUserId,
                                         SkillVisibility visibility,
                                         boolean adminEquivalent) {
        SkillCollection collection = requireCollection(collectionId);
        SkillCollectionVisibilities.requireAllowed(visibility);
        boolean owner = collection.getOwnerId().equals(actingUserId);
        boolean contributor = !owner
                && contributorRepository.existsByCollectionIdAndUserId(collectionId, actingUserId);
        authorizationPolicy.checkAllowed(owner, contributor, adminEquivalent,
                SkillCollectionAuthorizationPolicy.CollectionOperation.SET_VISIBILITY);
        collection.setVisibility(visibility);
        return skillCollectionRepository.save(collection);
    }

    @Transactional
    public void deleteCollection(Long collectionId, String actingUserId, boolean adminEquivalent) {
        SkillCollection collection = requireCollection(collectionId);
        boolean owner = collection.getOwnerId().equals(actingUserId);
        boolean contributor = !owner
                && contributorRepository.existsByCollectionIdAndUserId(collectionId, actingUserId);
        authorizationPolicy.checkAllowed(owner, contributor, adminEquivalent,
                SkillCollectionAuthorizationPolicy.CollectionOperation.DELETE_COLLECTION);
        skillCollectionRepository.delete(collection);
    }

    private SkillCollection requireCollection(Long collectionId) {
        return skillCollectionRepository.findById(collectionId)
                .orElseThrow(() -> new DomainBadRequestException("error.skillCollection.notFound", collectionId));
    }
}
