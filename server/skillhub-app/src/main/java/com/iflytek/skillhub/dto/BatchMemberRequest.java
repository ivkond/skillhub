package com.iflytek.skillhub.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BatchMemberRequest(
        @Size(max = MAX_MEMBERS, message = "{validation.batch.members.size}")
        @NotEmpty(message = "{validation.batch.members.notEmpty}")
        List<@Valid MemberRequest> members
) {
    public static final int MAX_MEMBERS = 100;
}
