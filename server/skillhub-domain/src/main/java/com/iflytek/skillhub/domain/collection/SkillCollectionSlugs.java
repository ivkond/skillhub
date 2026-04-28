package com.iflytek.skillhub.domain.collection;

import com.iflytek.skillhub.domain.shared.exception.DomainBadRequestException;

import java.util.Locale;
import java.util.Set;

/**
 * Normalizes and validates collection slugs (aligned with {@code skillhub_slugify} rules in Flyway V4).
 */
public final class SkillCollectionSlugs {

    private static final Set<String> RESERVED = Set.of(
            "admin", "api", "dashboard", "search", "auth", "me", "global", "system", "static", "assets", "health"
    );

    private SkillCollectionSlugs() {
    }

    public static String normalizeAndValidate(String raw) {
        if (raw == null || raw.trim().isEmpty()) {
            throw new DomainBadRequestException("error.skillCollection.slug.blank");
        }
        String slug = raw.trim().toLowerCase(Locale.ROOT);
        slug = slug.replaceAll("[^a-z0-9]+", "-");
        slug = slug.replaceAll("^-+", "");
        slug = slug.replaceAll("-+$", "");
        slug = slug.replaceAll("-{2,}", "-");
        if (slug.isEmpty()) {
            throw new DomainBadRequestException("error.skillCollection.slug.normalizedEmpty");
        }
        if (slug.length() < 2 || slug.length() > 64) {
            throw new DomainBadRequestException("error.skillCollection.slug.length");
        }
        if (RESERVED.contains(slug)) {
            throw new DomainBadRequestException("error.skillCollection.slug.reserved", slug);
        }
        return slug;
    }
}
