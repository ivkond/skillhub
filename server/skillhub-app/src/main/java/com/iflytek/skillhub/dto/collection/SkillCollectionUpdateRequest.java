package com.iflytek.skillhub.dto.collection;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SkillCollectionUpdateRequest(
        @NotBlank(message = "{validation.skillCollection.title.notBlank}")
        @Size(max = 200, message = "{validation.skillCollection.title.size}")
        String title,

        @Size(max = 2000, message = "{validation.skillCollection.description.size}")
        String description,

        @Size(min = 2, max = 64, message = "{validation.skillCollection.slug.size}")
        String slug
) {}
