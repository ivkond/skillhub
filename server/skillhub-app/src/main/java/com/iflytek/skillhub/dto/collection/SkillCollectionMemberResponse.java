package com.iflytek.skillhub.dto.collection;

import com.iflytek.skillhub.domain.collection.SkillCollectionMember;

public record SkillCollectionMemberResponse(
        Long membershipId,
        Long skillId,
        Integer sortOrder
) {
    public static SkillCollectionMemberResponse from(SkillCollectionMember member) {
        return new SkillCollectionMemberResponse(
                member.getId(),
                member.getSkillId(),
                member.getSortOrder()
        );
    }
}
