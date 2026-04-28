package com.iflytek.skillhub.domain.collection;

import com.iflytek.skillhub.domain.shared.exception.DomainBadRequestException;
import com.iflytek.skillhub.domain.skill.SkillVisibility;

/**
 * Collections only support PUBLIC / PRIVATE visibility in v1 (D-10 alignment with skill strings).
 */
public final class SkillCollectionVisibilities {

    private SkillCollectionVisibilities() {
    }

    public static void requireAllowed(SkillVisibility visibility) {
        if (visibility != SkillVisibility.PUBLIC && visibility != SkillVisibility.PRIVATE) {
            throw new DomainBadRequestException("error.skillCollection.visibility.notSupported", visibility.name());
        }
    }
}
