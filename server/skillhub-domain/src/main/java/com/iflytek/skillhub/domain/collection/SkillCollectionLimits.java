package com.iflytek.skillhub.domain.collection;

/**
 * Tunable caps for skill collections (see REQUIREMENTS.md).
 */
public final class SkillCollectionLimits {

    public static final int MAX_SKILLS_PER_COLLECTION = 100;
    public static final int MAX_COLLECTIONS_PER_OWNER = 50;
    public static final int MAX_CONTRIBUTORS_PER_COLLECTION = 20;

    private SkillCollectionLimits() {
    }
}
