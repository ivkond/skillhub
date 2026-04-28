package com.iflytek.skillhub.domain.collection;

import com.iflytek.skillhub.domain.shared.exception.DomainBadRequestException;
import org.springframework.stereotype.Component;

/**
 * Owner vs contributor vs admin-equivalent authorization for collection operations (ROL-07 / ROL-08 / D-12).
 */
@Component
public class SkillCollectionAuthorizationPolicy {

    public enum CollectionOperation {
        CREATE_COLLECTION,
        UPDATE_METADATA,
        DELETE_COLLECTION,
        SET_VISIBILITY,
        ADD_REMOVE_CONTRIBUTOR,
        ADD_SKILL,
        REMOVE_SKILL,
        REORDER_SKILLS
    }

    public void checkAllowed(boolean ownerActor,
                             boolean contributorActor,
                             boolean adminEquivalent,
                             CollectionOperation op) {
        if (adminEquivalent) {
            return;
        }
        if (ownerActor && contributorActor) {
            throw new DomainBadRequestException("error.skillCollection.auth.conflictingRoles");
        }
        if (ownerActor) {
            return;
        }
        if (contributorActor) {
            if (op == CollectionOperation.ADD_SKILL
                    || op == CollectionOperation.REMOVE_SKILL
                    || op == CollectionOperation.REORDER_SKILLS) {
                return;
            }
            throw new DomainBadRequestException("error.skillCollection.auth.contributorDenied", op.name());
        }
        throw new DomainBadRequestException("error.skillCollection.auth.forbidden", op.name());
    }
}
