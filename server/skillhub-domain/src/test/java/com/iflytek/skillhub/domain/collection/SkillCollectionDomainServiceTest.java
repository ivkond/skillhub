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
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;

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
    @DisplayName("Admin create without target owner uses acting user as collection owner")
    void adminCreateDefaultsOwnerToActingUser() {
        when(skillCollectionRepository.countByOwnerId("admin")).thenReturn(0L);
        when(skillCollectionRepository.existsByOwnerIdAndSlug("admin", "slug")).thenReturn(false);
        when(skillCollectionRepository.save(any(SkillCollection.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillCollection saved = service.createCollection("admin", "T", null, SkillVisibility.PUBLIC, "slug", true, null);

        assertEquals("admin", saved.getOwnerId());
        verify(skillCollectionRepository).save(any(SkillCollection.class));
    }

    @Test
    @DisplayName("Admin create with explicit target owner assigns that owner")
    void adminCreateWithExplicitTargetOwner() {
        when(skillCollectionRepository.countByOwnerId("other")).thenReturn(0L);
        when(skillCollectionRepository.existsByOwnerIdAndSlug("other", "slug")).thenReturn(false);
        when(skillCollectionRepository.save(any(SkillCollection.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillCollection saved = service.createCollection("admin", "T", null, SkillVisibility.PUBLIC, "slug", true, "other");

        assertEquals("other", saved.getOwnerId());
    }

    @Test
    @DisplayName("Unsupported collection visibility rejected")
    void namespaceOnlyVisibilityRejected() {
        assertThrows(DomainBadRequestException.class, () ->
                service.createCollection("owner-1", "T", null, SkillVisibility.NAMESPACE_ONLY, "ok-slug", false, null));
    }

    @Test
    @DisplayName("ROL-07: contributor cannot change visibility")
    void contributorCannotChangeVisibility() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(contributorRepository.existsByCollectionIdAndUserId(10L, "contrib-1")).thenReturn(true);

        assertThrows(DomainBadRequestException.class, () ->
                service.setVisibility(10L, "contrib-1", SkillVisibility.PRIVATE, false));
        verify(skillCollectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("ROL-08: admin equivalent may change visibility")
    void adminCanChangeVisibility() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(skillCollectionRepository.save(any(SkillCollection.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillCollection saved = service.setVisibility(10L, "admin-1", SkillVisibility.PRIVATE, true);

        assertEquals(SkillVisibility.PRIVATE, saved.getVisibility());
        verify(skillCollectionRepository).save(c);
    }

    @Test
    @DisplayName("ROL-07: contributor cannot delete collection")
    void contributorCannotDeleteCollection() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(contributorRepository.existsByCollectionIdAndUserId(10L, "contrib-1")).thenReturn(true);

        assertThrows(DomainBadRequestException.class, () ->
                service.deleteCollection(10L, "contrib-1", false));
        verify(skillCollectionRepository, never()).delete(any());
    }

    @Test
    @DisplayName("ROL-08: admin equivalent may delete foreign collection")
    void adminCanDeleteForeignCollection() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));

        service.deleteCollection(10L, "admin-1", true);

        verify(skillCollectionRepository).delete(c);
    }

    @Test
    @DisplayName("D-06: duplicate slug on metadata update throws")
    void duplicateSlugOnMetadataUpdate() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(skillCollectionRepository.existsByOwnerIdAndSlugAndIdNot("owner-1", "taken-slug", c.getId()))
                .thenReturn(true);

        assertThrows(DomainBadRequestException.class, () ->
                service.updateMetadata(10L, "owner-1", "New", "D", "taken-slug", false));
        verify(skillCollectionRepository, never()).save(any());
    }

    @Test
    @DisplayName("Description trim invariant: blank description is normalized to null")
    void blankDescriptionNormalizedToNull() {
        SkillCollection c = new SkillCollection("owner-1", "my-col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(10L)).thenReturn(Optional.of(c));
        when(skillCollectionRepository.save(any(SkillCollection.class))).thenAnswer(inv -> inv.getArgument(0));

        SkillCollection saved = service.updateMetadata(10L, "owner-1", "New", "   ", null, false);

        assertNull(saved.getDescription());
        verify(skillCollectionRepository).save(c);
    }
}
