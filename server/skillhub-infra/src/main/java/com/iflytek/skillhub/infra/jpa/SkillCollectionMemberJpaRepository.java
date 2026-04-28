package com.iflytek.skillhub.infra.jpa;

import com.iflytek.skillhub.domain.collection.SkillCollectionMember;
import com.iflytek.skillhub.domain.collection.SkillCollectionMemberRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * JPA-backed repository for skill collection membership rows.
 */
@Repository
public interface SkillCollectionMemberJpaRepository
        extends JpaRepository<SkillCollectionMember, Long>, SkillCollectionMemberRepository {

    @Override
    List<SkillCollectionMember> findByCollectionIdOrderBySortOrderAscIdAsc(Long collectionId);
}
