package com.iflytek.skillhub.auth.oauth;

import com.iflytek.skillhub.auth.rbac.PlatformPrincipal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.OAuth2AccessToken;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class CustomOidcUserServiceTest {

    @Test
    void loadUser_withOidcContext_embedsPlatformPrincipalAndPlatformRoles() {
        OAuthLoginFlowService flowService = mock(OAuthLoginFlowService.class);
        CustomOidcUserService service = new CustomOidcUserService(flowService);
        PlatformPrincipal principal = new PlatformPrincipal(
                "user-oidc-1",
                "Oidc User",
                "oidc-user@example.com",
                null,
                "google",
                Set.of("USER")
        );
        OidcUserRequest request = oidcRequest("sub");
        OidcUser upstreamUser = upstreamOidcUser();
        when(flowService.loadOidcLoginContext(request))
                .thenReturn(new OAuthLoginFlowService.AuthenticatedLoginContext(upstreamUser, principal));

        OidcUser result = service.loadUser(request);

        assertThat((Object) result.getAttribute("platformPrincipal")).isEqualTo(principal);
        assertThat(result.getAuthorities())
                .extracting("authority")
                .contains("ROLE_USER");
        assertThat((Object) result.getIdToken().getClaim("platformPrincipal")).isEqualTo(principal);
        assertThat(result.getName()).isEqualTo("google-oidc-subject-upstream");
    }

    @Test
    void loadUser_withConflictingUserInfoPrincipal_overridesWithResolvedPlatformPrincipal() {
        OAuthLoginFlowService flowService = mock(OAuthLoginFlowService.class);
        CustomOidcUserService service = new CustomOidcUserService(flowService);
        PlatformPrincipal principal = new PlatformPrincipal(
                "user-oidc-2",
                "Oidc User 2",
                "oidc-user2@example.com",
                null,
                "google",
                Set.of("USER")
        );
        OidcUserRequest request = oidcRequest("sub");
        OidcUser upstreamUser = upstreamOidcUserWithConflictingUserInfo();
        when(flowService.loadOidcLoginContext(request))
                .thenReturn(new OAuthLoginFlowService.AuthenticatedLoginContext(upstreamUser, principal));

        OidcUser result = service.loadUser(request);

        assertThat((Object) result.getAttribute("platformPrincipal")).isEqualTo(principal);
        assertThat((Object) result.getUserInfo().getClaim("platformPrincipal")).isEqualTo(principal);
    }

    private OidcUserRequest oidcRequest(String userNameAttributeName) {
        OidcUserRequest request = mock(OidcUserRequest.class);
        when(request.getClientRegistration()).thenReturn(clientRegistration(userNameAttributeName));
        return request;
    }

    private ClientRegistration clientRegistration(String userNameAttributeName) {
        return ClientRegistration.withRegistrationId("google")
                .clientId("client-id")
                .clientSecret("client-secret")
                .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
                .authorizationUri("https://accounts.example.com/o/oauth2/v2/auth")
                .tokenUri("https://oauth2.example.com/token")
                .redirectUri("{baseUrl}/login/oauth2/code/{registrationId}")
                .userInfoUri("https://openidconnect.example.com/v1/userinfo")
                .userNameAttributeName(userNameAttributeName)
                .scope("openid", "profile", "email")
                .clientName("Google")
                .build();
    }

    private OidcUser upstreamOidcUser() {
        OidcIdToken idToken = new OidcIdToken(
                "id-token-value",
                Instant.now(),
                Instant.now().plusSeconds(300),
                Map.of(
                        "sub", "google-oidc-subject-upstream",
                        "email", "upstream-oidc@example.com",
                        "email_verified", true,
                        "name", "Upstream OIDC User"
                )
        );
        return new DefaultOidcUser(List.of(), idToken, "sub");
    }

    private OidcUser upstreamOidcUserWithConflictingUserInfo() {
        OidcIdToken idToken = new OidcIdToken(
                "id-token-value",
                Instant.now(),
                Instant.now().plusSeconds(300),
                Map.of(
                        "sub", "google-oidc-subject-upstream",
                        "email", "upstream-oidc@example.com",
                        "email_verified", true,
                        "name", "Upstream OIDC User"
                )
        );
        Map<String, Object> userInfoClaims = new HashMap<>();
        userInfoClaims.put("sub", "google-oidc-subject-upstream");
        userInfoClaims.put("email", "upstream-oidc@example.com");
        userInfoClaims.put("name", "Upstream OIDC User");
        userInfoClaims.put("platformPrincipal", "upstream-conflict");
        OidcUserInfo userInfo = new OidcUserInfo(userInfoClaims);
        return new DefaultOidcUser(List.of(), idToken, userInfo, "sub");
    }
}
