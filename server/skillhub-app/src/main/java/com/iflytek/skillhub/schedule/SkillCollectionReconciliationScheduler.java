package com.iflytek.skillhub.schedule;

import com.iflytek.skillhub.domain.collection.SkillCollection;
import com.iflytek.skillhub.domain.collection.SkillCollectionMembershipService;
import com.iflytek.skillhub.domain.collection.SkillCollectionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SkillCollectionReconciliationScheduler {

    private static final Logger log = LoggerFactory.getLogger(SkillCollectionReconciliationScheduler.class);
    private static final int BATCH_SIZE = 100;

    private final SkillCollectionRepository skillCollectionRepository;
    private final SkillCollectionMembershipService membershipService;

    public SkillCollectionReconciliationScheduler(SkillCollectionRepository skillCollectionRepository,
                                                  SkillCollectionMembershipService membershipService) {
        this.skillCollectionRepository = skillCollectionRepository;
        this.membershipService = membershipService;
    }

    @Scheduled(cron = "${skillhub.collections.reconcile-cron}")
    public void reconcileAllCollections() {
        int page = 0;
        while (true) {
            Page<SkillCollection> collections = skillCollectionRepository.findAll(PageRequest.of(page, BATCH_SIZE));
            if (collections.isEmpty()) {
                break;
            }
            collections.stream()
                    .map(SkillCollection::getId)
                    .forEach(this::reconcileCollectionSafely);
            page++;
        }
    }

    private void reconcileCollectionSafely(Long collectionId) {
        try {
            membershipService.reconcileInvisibleSkillsForCollection(collectionId);
        } catch (RuntimeException ex) {
            log.warn("Failed to reconcile collection {}", collectionId, ex);
        }
    }
}
