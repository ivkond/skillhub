package com.iflytek.skillhub.infra.collection;

import com.iflytek.skillhub.domain.collection.SkillReadableForActorPort;
import com.iflytek.skillhub.domain.namespace.NamespaceMember;
import com.iflytek.skillhub.domain.namespace.NamespaceMemberRepository;
import com.iflytek.skillhub.domain.namespace.NamespaceRole;
import com.iflytek.skillhub.domain.skill.Skill;
import com.iflytek.skillhub.domain.skill.SkillRepository;
import com.iflytek.skillhub.domain.skill.VisibilityChecker;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;
import java.util.Set;

/**
 * Bridges {@link SkillReadableForActorPort} to {@link VisibilityChecker} using persisted skills and namespace roles.
 */
@Service
public class SkillReadableForActorAdapter implements SkillReadableForActorPort {

    private final SkillRepository skillRepository;
    private final NamespaceMemberRepository namespaceMemberRepository;
    private final VisibilityChecker visibilityChecker;

    public SkillReadableForActorAdapter(SkillRepository skillRepository,
                                        NamespaceMemberRepository namespaceMemberRepository,
                                        VisibilityChecker visibilityChecker) {
        this.skillRepository = skillRepository;
        this.namespaceMemberRepository = namespaceMemberRepository;
        this.visibilityChecker = visibilityChecker;
    }

    @Override
    public boolean canActingUserReadSkill(String actingUserId, long skillId) {
        Skill skill = skillRepository.findById(skillId).orElse(null);
        if (skill == null) {
            return false;
        }
        Map<Long, NamespaceRole> roles = namespaceRolesForUser(actingUserId);
        return visibilityChecker.canAccess(skill, actingUserId, roles, Set.of());
    }

    private Map<Long, NamespaceRole> namespaceRolesForUser(String userId) {
        if (userId == null || userId.isBlank()) {
            return Map.of();
        }
        Map<Long, NamespaceRole> map = new HashMap<>();
        for (NamespaceMember member : namespaceMemberRepository.findByUserId(userId)) {
            map.merge(member.getNamespaceId(), member.getRole(), SkillReadableForActorAdapter::strongerRole);
        }
        return map;
    }

    private static NamespaceRole strongerRole(NamespaceRole a, NamespaceRole b) {
        if (a == NamespaceRole.OWNER || b == NamespaceRole.OWNER) {
            return NamespaceRole.OWNER;
        }
        if (a == NamespaceRole.ADMIN || b == NamespaceRole.ADMIN) {
            return NamespaceRole.ADMIN;
        }
        return a;
    }
}
