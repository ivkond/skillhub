package com.iflytek.skillhub.domain.collection;

/**
 * Narrow port for whether an acting user may read a skill under portal visibility rules.
 * Implemented outside this module in production; mocked in domain tests (COL-04 / ROL-04 / INT-01).
 */
public interface SkillReadableForActorPort {

    boolean canActingUserReadSkill(String actingUserId, long skillId);
}
