package com.iflytek.skillhub.schedule;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.iflytek.skillhub.domain.collection.SkillCollection;
import com.iflytek.skillhub.domain.collection.SkillCollectionMembershipService;
import com.iflytek.skillhub.domain.collection.SkillCollectionRepository;
import com.iflytek.skillhub.domain.skill.SkillVisibility;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;

@ExtendWith(MockitoExtension.class)
class SkillCollectionReconciliationSchedulerTest {

    @Mock
    private SkillCollectionRepository collectionRepository;

    @Mock
    private SkillCollectionMembershipService membershipService;

    @Test
    void reconcileAllCollections_processesOnlyStaleBatchesAndPersistsTimestamp() {
        SkillCollection first = collection(1L);
        SkillCollection second = collection(2L);

        when(collectionRepository.findByIdGreaterThanAndLastReconciledAtBeforeOrderByIdAsc(eq(0L), any(Instant.class), any(Pageable.class)))
                .thenReturn(List.of(first, second));
        when(collectionRepository.findByIdGreaterThanAndLastReconciledAtBeforeOrderByIdAsc(eq(2L), any(Instant.class), any(Pageable.class)))
                .thenReturn(List.of());

        SkillCollectionReconciliationScheduler scheduler =
                new SkillCollectionReconciliationScheduler(collectionRepository, membershipService, Duration.ofHours(24));

        scheduler.reconcileAllCollections();

        verify(membershipService).reconcileInvisibleSkillsForCollection(1L);
        verify(membershipService).reconcileInvisibleSkillsForCollection(2L);
        verify(collectionRepository, times(2)).save(any(SkillCollection.class));
    }

    @Test
    void reconcileAllCollections_keepsGoingWhenSingleCollectionFails() {
        SkillCollection first = collection(10L);
        SkillCollection second = collection(11L);

        when(collectionRepository.findByIdGreaterThanAndLastReconciledAtBeforeOrderByIdAsc(eq(0L), any(Instant.class), any(Pageable.class)))
                .thenReturn(List.of(first, second));
        when(collectionRepository.findByIdGreaterThanAndLastReconciledAtBeforeOrderByIdAsc(eq(11L), any(Instant.class), any(Pageable.class)))
                .thenReturn(List.of());
        when(membershipService.reconcileInvisibleSkillsForCollection(10L))
                .thenThrow(new IllegalStateException("boom"));

        SkillCollectionReconciliationScheduler scheduler =
                new SkillCollectionReconciliationScheduler(collectionRepository, membershipService, Duration.ofHours(24));

        scheduler.reconcileAllCollections();

        verify(membershipService).reconcileInvisibleSkillsForCollection(10L);
        verify(membershipService).reconcileInvisibleSkillsForCollection(11L);
        verify(collectionRepository).save(second);
        verify(collectionRepository, never()).save(first);
    }

    private SkillCollection collection(Long id) {
        SkillCollection collection = new SkillCollection("owner-" + id, "slug-" + id, "Collection " + id, SkillVisibility.PUBLIC);
        setId(collection, id);
        return collection;
    }

    private void setId(SkillCollection collection, Long id) {
        try {
            var field = SkillCollection.class.getDeclaredField("id");
            field.setAccessible(true);
            field.set(collection, id);
        } catch (ReflectiveOperationException ex) {
            throw new IllegalStateException(ex);
        }
    }
}
