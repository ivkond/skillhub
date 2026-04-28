package com.iflytek.skillhub.infra.collection;

import com.iflytek.skillhub.domain.namespace.NamespaceMember;
import com.iflytek.skillhub.domain.namespace.NamespaceMemberRepository;
import com.iflytek.skillhub.domain.namespace.NamespaceRole;
import com.iflytek.skillhub.domain.skill.Skill;
import com.iflytek.skillhub.domain.skill.SkillRepository;
import com.iflytek.skillhub.domain.skill.SkillVisibility;
import com.iflytek.skillhub.domain.skill.VisibilityChecker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillReadableForActorAdapterTest {

    @Mock
    private SkillRepository skillRepository;
    @Mock
    private NamespaceMemberRepository namespaceMemberRepository;
    @Mock
    private VisibilityChecker visibilityChecker;

    private SkillReadableForActorAdapter adapter;

    @BeforeEach
    void setUp() {
        adapter = new SkillReadableForActorAdapter(skillRepository, namespaceMemberRepository, visibilityChecker);
    }

    @Test
    void anonymousActorUsesEmptyNamespaceRolesAndDoesNotLoadMembershipRows() {
        Skill skill = new Skill(1L, "public-skill", "owner-1", SkillVisibility.PUBLIC);
        when(skillRepository.findById(10L)).thenReturn(Optional.of(skill));
        when(visibilityChecker.canAccess(skill, null, Map.of(), Set.of())).thenReturn(true);

        boolean readable = adapter.canActingUserReadSkill(null, 10L);

        assertTrue(readable);
        verify(namespaceMemberRepository, never()).findByUserId(any());
        verify(visibilityChecker).canAccess(skill, null, Map.of(), Set.of());
    }

    @Test
    void namespaceRolesAreMergedWithStrongerRoleBeforeVisibilityCheck() {
        Skill skill = new Skill(1L, "private-skill", "owner-1", SkillVisibility.PRIVATE);
        NamespaceMember memberRole = new NamespaceMember(1L, "user-1", NamespaceRole.MEMBER);
        NamespaceMember adminRole = new NamespaceMember(1L, "user-1", NamespaceRole.ADMIN);
        when(skillRepository.findById(11L)).thenReturn(Optional.of(skill));
        when(namespaceMemberRepository.findByUserId("user-1")).thenReturn(List.of(memberRole, adminRole));
        when(visibilityChecker.canAccess(skill, "user-1", Map.of(1L, NamespaceRole.ADMIN), Set.of())).thenReturn(true);

        boolean readable = adapter.canActingUserReadSkill("user-1", 11L);

        assertTrue(readable);
        verify(visibilityChecker).canAccess(eq(skill), eq("user-1"), eq(Map.of(1L, NamespaceRole.ADMIN)), eq(Set.of()));
    }

    @Test
    void missingSkillReturnsFalseWithoutVisibilityCheck() {
        when(skillRepository.findById(999L)).thenReturn(Optional.empty());

        boolean readable = adapter.canActingUserReadSkill("user-1", 999L);

        assertFalse(readable);
        verify(visibilityChecker, never()).canAccess(any(), any(), any(), any());
    }
}
