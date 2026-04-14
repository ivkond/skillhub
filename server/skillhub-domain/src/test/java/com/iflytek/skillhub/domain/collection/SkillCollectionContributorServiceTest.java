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

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SkillCollectionContributorServiceTest {

    @Mock
    private SkillCollectionRepository skillCollectionRepository;
    @Mock
    private SkillCollectionContributorRepository contributorRepository;

    private SkillCollectionContributorService service;

    @BeforeEach
    void setUp() {
        service = new SkillCollectionContributorService(skillCollectionRepository, contributorRepository,
                new SkillCollectionAuthorizationPolicy());
    }

    @Test
    @DisplayName("ROL-07: contributor cannot add another contributor")
    void contributor_cannotAddContributor() {
        SkillCollection c = new SkillCollection("owner-1", "col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(5L)).thenReturn(Optional.of(c));
        when(contributorRepository.existsByCollectionIdAndUserId(5L, "contrib-1")).thenReturn(true);

        assertThrows(DomainBadRequestException.class, () ->
                service.addContributor(5L, "contrib-1", "user-9", false));
        verify(contributorRepository, never()).save(any());
    }

    @Test
    @DisplayName("21st contributor throws")
    void capContributors() {
        SkillCollection c = new SkillCollection("owner-1", "col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(5L)).thenReturn(Optional.of(c));
        when(contributorRepository.existsByCollectionIdAndUserId(5L, "new-user")).thenReturn(false);
        when(contributorRepository.countByCollectionId(5L)).thenReturn(20L);

        assertThrows(DomainBadRequestException.class, () ->
                service.addContributor(5L, "owner-1", "new-user", false));
    }

    @Test
    @DisplayName("Cannot add collection owner as contributor")
    void cannotAddOwnerAsContributor() {
        SkillCollection c = new SkillCollection("owner-1", "col", "T", SkillVisibility.PUBLIC);
        when(skillCollectionRepository.findById(5L)).thenReturn(Optional.of(c));

        assertThrows(DomainBadRequestException.class, () ->
                service.addContributor(5L, "owner-1", "owner-1", false));
    }
}
