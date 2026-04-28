package com.iflytek.skillhub.domain.collection;

import java.util.List;

/**
 * Domain repository contract for collection membership rows and ordering.
 */
public interface SkillCollectionMemberRepository {

    boolean existsByCollectionIdAndSkillId(Long collectionId, Long skillId);

    List<SkillCollectionMember> findByCollectionIdOrderBySortOrderAscIdAsc(Long collectionId);

    long countByCollectionId(Long collectionId);

    void deleteByCollectionIdAndSkillId(Long collectionId, Long skillId);

    <S extends SkillCollectionMember> List<S> saveAll(Iterable<S> entities);

    SkillCollectionMember save(SkillCollectionMember member);

    void delete(SkillCollectionMember member);
}
