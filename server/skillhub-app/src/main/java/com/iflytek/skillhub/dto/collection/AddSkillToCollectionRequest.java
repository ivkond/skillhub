package com.iflytek.skillhub.dto.collection;

import jakarta.validation.constraints.NotNull;

public record AddSkillToCollectionRequest(
        @NotNull(message = "{validation.skillCollection.skillId.notNull}")
        Long skillId
) {}
