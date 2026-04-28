package com.iflytek.skillhub.auth.oauth;

import jakarta.servlet.http.HttpSession;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

class OAuth2LoginHandlersTest {

    @Test
    void successHandler_redirectsToStoredReturnTo() throws Exception {
        OAuthLoginFlowService oauthLoginFlowService = mock(OAuthLoginFlowService.class);
        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(
                new com.iflytek.skillhub.auth.session.PlatformSessionService(),
                oauthLoginFlowService
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        HttpSession session = request.getSession(true);
        String originalSessionId = session.getId();
        session.setAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE, "/dashboard/publish");

        var principal = new com.iflytek.skillhub.auth.rbac.PlatformPrincipal(
                "user-1", "User", "user@example.com", null, "github", Set.of("USER")
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new DefaultOAuth2User(List.of(), Map.of("platformPrincipal", principal, "login", "user"), "login"),
                null,
                List.of()
        );

        org.mockito.Mockito.when(oauthLoginFlowService.consumeReturnTo(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> {
                    HttpSession currentSession = invocation.getArgument(0);
                    Object value = currentSession.getAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE);
                    currentSession.removeAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE);
                    return value;
                });

        handler.onAuthenticationSuccess(request, response, authentication);

        SecurityContext securityContext = (SecurityContext) session.getAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY
        );
        assertThat(response.getRedirectedUrl()).isEqualTo("/dashboard/publish");
        assertThat(request.getSession(false).getId()).isEqualTo(originalSessionId);
        assertThat(session.getAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE)).isNull();
        assertThat(session.getAttribute("platformPrincipal")).isEqualTo(principal);
        assertThat(securityContext).isNotNull();
        assertThat(securityContext.getAuthentication()).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(securityContext.getAuthentication().getPrincipal()).isEqualTo(principal);
        assertThat(securityContext.getAuthentication().getAuthorities())
                .extracting("authority")
                .containsExactly("ROLE_USER");
    }

    @Test
    void failureHandler_redirectsBackToLoginWithReturnTo() throws Exception {
        OAuthLoginFlowService oauthLoginFlowService = mock(OAuthLoginFlowService.class);
        OAuth2LoginFailureHandler handler = new OAuth2LoginFailureHandler(oauthLoginFlowService);
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        HttpSession session = request.getSession(true);
        session.setAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE, "/settings/accounts");
        org.mockito.Mockito.when(oauthLoginFlowService.consumeReturnTo(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> {
                    HttpSession currentSession = invocation.getArgument(0);
                    Object value = currentSession.getAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE);
                    currentSession.removeAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE);
                    return value;
                });
        org.mockito.Mockito.when(oauthLoginFlowService.resolveFailureRedirect(
                        org.mockito.ArgumentMatchers.any(),
                        org.mockito.ArgumentMatchers.eq("/settings/accounts")))
                .thenReturn("/login?returnTo=%2Fsettings%2Faccounts");

        handler.onAuthenticationFailure(
                request,
                response,
                new OAuth2AuthenticationException(new OAuth2Error("invalid_request"))
        );

        assertThat(response.getRedirectedUrl()).isEqualTo("/login?returnTo=%2Fsettings%2Faccounts");
        assertThat(session.getAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE)).isNull();
    }

    @Test
    void successHandler_withOidcPrincipal_attachesPlatformPrincipalToSession() throws Exception {
        OAuthLoginFlowService oauthLoginFlowService = mock(OAuthLoginFlowService.class);
        OAuth2LoginSuccessHandler handler = new OAuth2LoginSuccessHandler(
                new com.iflytek.skillhub.auth.session.PlatformSessionService(),
                oauthLoginFlowService
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        HttpSession session = request.getSession(true);
        session.setAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE, "/dashboard");
        org.mockito.Mockito.when(oauthLoginFlowService.consumeReturnTo(org.mockito.ArgumentMatchers.any()))
                .thenAnswer(invocation -> {
                    HttpSession currentSession = invocation.getArgument(0);
                    Object value = currentSession.getAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE);
                    currentSession.removeAttribute(OAuthLoginRedirectSupport.SESSION_RETURN_TO_ATTRIBUTE);
                    return value;
                });

        var principal = new com.iflytek.skillhub.auth.rbac.PlatformPrincipal(
                "user-oidc-1", "Oidc User", "oidc-user@example.com", null, "google", Set.of("USER")
        );
        OidcIdToken idToken = new OidcIdToken(
                "id-token",
                Instant.now(),
                Instant.now().plusSeconds(300),
                Map.of(
                        "sub", "google-subject-1",
                        "email", "oidc-user@example.com",
                        "platformPrincipal", principal
                )
        );
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                new DefaultOidcUser(List.of(), idToken, "sub"),
                null,
                List.of()
        );

        handler.onAuthenticationSuccess(request, response, authentication);

        SecurityContext securityContext = (SecurityContext) session.getAttribute(
                HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY
        );
        assertThat(response.getRedirectedUrl()).isEqualTo("/dashboard");
        assertThat(session.getAttribute("platformPrincipal")).isEqualTo(principal);
        assertThat(securityContext).isNotNull();
        assertThat(securityContext.getAuthentication()).isInstanceOf(UsernamePasswordAuthenticationToken.class);
        assertThat(securityContext.getAuthentication().getPrincipal()).isEqualTo(principal);
    }
}
