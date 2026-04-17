package com.iflytek.skillhub.auth.oauth;

import java.util.Map;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

/**
 * Provider-specific extractor for Google OAuth user info payloads.
 */
@Component
public class GoogleClaimsExtractor implements OAuthClaimsExtractor {

    @Override
    public String getProvider() {
        return "google";
    }

    @Override
    public OAuthClaims extract(OAuth2UserRequest request, OAuth2User oAuth2User) {
        Map<String, Object> attrs = oAuth2User.getAttributes();
        Object subjectValue = attrs.get("sub");
        if (subjectValue == null) {
            throw new OAuth2AuthenticationException(
                    new OAuth2Error("invalid_user_info", "Missing required Google claim: sub", null)
            );
        }

        return new OAuthClaims(
                "google",
                String.valueOf(subjectValue),
                (String) attrs.get("email"),
                Boolean.TRUE.equals(attrs.get("email_verified")),
                (String) attrs.get("name"),
                attrs
        );
    }
}
