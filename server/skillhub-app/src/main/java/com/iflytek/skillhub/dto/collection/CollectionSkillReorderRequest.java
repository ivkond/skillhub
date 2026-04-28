package com.iflytek.skillhub.dto.collection;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public record CollectionSkillReorderRequest(
        @NotEmpty(message = "{validation.skillCollection.order.notEmpty}")
        List<@NotNull(message = "{validation.skillCollection.order.skillId.notNull}") Long> skillIdsInOrder
) {}
