package com.iflytek.skillhub.domain.collection;

import com.iflytek.skillhub.domain.shared.exception.DomainBadRequestException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;

class SkillCollectionAuthorizationPolicyTest {

    private SkillCollectionAuthorizationPolicy policy;

    @BeforeEach
    void setUp() {
        policy = new SkillCollectionAuthorizationPolicy();
    }

    @Test
    @DisplayName("ROL-08: admin equivalent bypasses contributor restrictions")
    void adminEquivalent_allowsOwnerOnlyOperations() {
        assertDoesNotThrow(() -> policy.checkAllowed(false, true, true,
                SkillCollectionAuthorizationPolicy.CollectionOperation.DELETE_COLLECTION));
        assertDoesNotThrow(() -> policy.checkAllowed(false, true, true,
                SkillCollectionAuthorizationPolicy.CollectionOperation.ADD_REMOVE_CONTRIBUTOR));
    }

    @ParameterizedTest
    @EnumSource(value = SkillCollectionAuthorizationPolicy.CollectionOperation.class,
            names = {"ADD_SKILL", "REMOVE_SKILL", "REORDER_SKILLS"})
    @DisplayName("Contributor may mutate membership only")
    void contributor_allowedForMembershipOps(SkillCollectionAuthorizationPolicy.CollectionOperation op) {
        assertDoesNotThrow(() -> policy.checkAllowed(false, true, false, op));
    }

    @ParameterizedTest
    @EnumSource(value = SkillCollectionAuthorizationPolicy.CollectionOperation.class,
            names = {"UPDATE_METADATA", "SET_VISIBILITY", "DELETE_COLLECTION", "ADD_REMOVE_CONTRIBUTOR", "CREATE_COLLECTION"})
    @DisplayName("ROL-07: contributor denied for owner-only operations")
    void contributor_deniedForOwnerOps(SkillCollectionAuthorizationPolicy.CollectionOperation op) {
        assertThrows(DomainBadRequestException.class, () -> policy.checkAllowed(false, true, false, op));
    }

    @Test
    @DisplayName("Owner may perform contributor-restricted operations")
    void owner_allowedAll() {
        for (SkillCollectionAuthorizationPolicy.CollectionOperation op : SkillCollectionAuthorizationPolicy.CollectionOperation.values()) {
            assertDoesNotThrow(() -> policy.checkAllowed(true, false, false, op));
        }
    }

    @Test
    @DisplayName("Stranger denied")
    void stranger_denied() {
        assertThrows(DomainBadRequestException.class, () -> policy.checkAllowed(false, false, false,
                SkillCollectionAuthorizationPolicy.CollectionOperation.ADD_SKILL));
    }

    @Test
    @DisplayName("Conflicting owner and contributor flags rejected")
    void conflictingRoles() {
        assertThrows(DomainBadRequestException.class, () -> policy.checkAllowed(true, true, false,
                SkillCollectionAuthorizationPolicy.CollectionOperation.ADD_SKILL));
    }
}
