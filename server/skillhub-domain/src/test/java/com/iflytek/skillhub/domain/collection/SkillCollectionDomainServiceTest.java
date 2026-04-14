package com.iflytek.skillhub.domain.collection;

import com.iflytek.skillhub.domain.shared.exception.DomainBadRequestException;
import com.iflytek.skillhub.domain.skill.SkillVisibility;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillCollectionDomainServiceTest {

    @Mock
    private SkillCollectionRepository skillCollectionRepository;
    @Mock
    private SkillCollectionContributorRepository contributorRepository;

    private SkillCollectionDomainService service;

    @BeforeEach
    void setUp() {
        service = new SkillCollectionDomainService(skillCollectionRepository, contributorRepository,
                new SkillCollectionAuthorizationPolicy());
    }

    @Test
    @DisplayName("ROL-07: contributor cannot update metadata")
    void contributor_cannotUpdateMetadata() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(contributorRepository.existsByCollectionIdAndUserId(10L, "contrib-1")).thenReturn(true);

        assertThrows(DomainBadRequestException.class, () ->
                service.updateMetadata(10L, "contrib-1", "New", null, null, false));
        verify(skillCollectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("ROL-08: admin equivalent may update metadata without contributor row")
    void adminMayUpdateMetadata() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(skillCollectionRepository.save(any(SkillCollection.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillCollection saved = service.updateMetadata(10L, "admin-1", "New title", "d", null, true);

        assertEquals("New title", saved.getTitle());
        verify(skillCollectionRepository).save(c);
    }

    @Test
    @DisplayName("D-06: duplicate slug on create throws")
    void duplicateSlugOnCreate() {
        when(skillCollectionRepository.countByOwnerId("owner-1")).thenReturn(0L);
        when(skillCollectionRepository.existsByOwnerIdAndSlug("owner-1", "taken-slug")).thenReturn(true);

        assertThrows(DomainBadRequestException.class, () ->
                service.createCollection("owner-1", "T", null, SkillVisibility.PUBLIC, "taken-slug", false, null));
    }

    @Test
    @DisplayName("Caps: 51st collection for owner throws")
    void capCollectionsPerOwner() {
        when(skillCollectionRepository.countByOwnerId("owner-1")).thenReturn(50L);

        assertThrows(DomainBadRequestException.class, () ->
                service.createCollection("owner-1", "T", null, SkillVisibility.PUBLIC, "new-slug", false, null));
    }

    @Test
    @DisplayName("Admin create requires target owner id")
    void adminCreateRequiresTargetOwner() {
        assertThrows(DomainBadRequestException.class, () ->
                service.createCollection("admin", "T", null, SkillVisibility.PUBLIC, "slug", true, " "));
    }

    @Test
    @DisplayName("Unsupported collection visibility rejected")
    void namespaceOnlyVisibilityRejected() {
        assertThrows(DomainBadRequestException.class, () ->
                service.createCollection("owner-1", "T", null, SkillVisibility.NAMESPACE_ONLY, "ok-slug", false, null));
    }
}
