package com.iflytek.skillhub.infra.jpa;

import com.iflytek.skillhub.domain.collection.SkillCollection;
import com.iflytek.skillhub.domain.collection.SkillCollectionRepository;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * JPA-backed repository for skill collection aggregates.
 */
@Repository
public interface SkillCollectionJpaRepository extends JpaRepository<SkillCollection, Long>, SkillCollectionRepository {
}
