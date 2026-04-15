package com.iflytek.skillhub.dto.collection;

import jakarta.validation.constraints.NotBlank;

public record AddContributorRequest(
        @NotBlank(message = "{validation.skillCollection.contributor.userId.notBlank}")
        String userId
) {}
