package com.iflytek.skillhub.schedule;

import com.iflytek.skillhub.domain.collection.SkillCollection;
import com.iflytek.skillhub.domain.collection.SkillCollectionMembershipService;
import com.iflytek.skillhub.domain.collection.SkillCollectionRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SkillCollectionReconciliationScheduler {

    private static final Logger log = LoggerFactory.getLogger(SkillCollectionReconciliationScheduler.class);
    private static final int BATCH_SIZE = 100;

    private final SkillCollectionRepository skillCollectionRepository;
    private final SkillCollectionMembershipService membershipService;
    private final Duration reconcileStaleAfter;

    public SkillCollectionReconciliationScheduler(SkillCollectionRepository skillCollectionRepository,
                                                  SkillCollectionMembershipService membershipService,
                                                  @Value("${skillhub.collections.reconcile-stale-after:PT24H}")
                                                  Duration reconcileStaleAfter) {
        this.skillCollectionRepository = skillCollectionRepository;
        this.membershipService = membershipService;
        this.reconcileStaleAfter = reconcileStaleAfter;
    }

    @Scheduled(cron = "${skillhub.collections.reconcile-cron}")
    public void reconcileAllCollections() {
        Instant now = Instant.now();
        Instant staleBefore = now.minus(reconcileStaleAfter);
        long cursor = 0L;
        while (true) {
            List<SkillCollection> collections = skillCollectionRepository
                    .findByIdGreaterThanAndLastReconciledAtBeforeOrderByIdAsc(
                            cursor,
                            staleBefore,
                            PageRequest.of(0, BATCH_SIZE)
                    );
            if (collections.isEmpty()) {
                break;
            }
            for (SkillCollection collection : collections) {
                cursor = collection.getId();
                reconcileCollectionSafely(collection, now);
            }
        }
    }

    private void reconcileCollectionSafely(SkillCollection collection, Instant reconciledAt) {
        try {
            membershipService.reconcileInvisibleSkillsForCollection(collection.getId());
            collection.markReconciled(reconciledAt);
            skillCollectionRepository.save(collection);
        } catch (RuntimeException ex) {
            log.warn("Failed to reconcile collection {}", collection.getId(), ex);
        }
    }
}
