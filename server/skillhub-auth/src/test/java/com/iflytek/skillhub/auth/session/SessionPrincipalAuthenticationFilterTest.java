package com.iflytek.skillhub.auth.session;

import com.iflytek.skillhub.auth.rbac.PlatformPrincipal;
import java.util.Set;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class SessionPrincipalAuthenticationFilterTest {

    private final PlatformSessionService platformSessionService = new PlatformSessionService();
    private final SessionPrincipalAuthenticationFilter filter =
            new SessionPrincipalAuthenticationFilter(platformSessionService);

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void shouldRestoreAuthenticationFromSessionPrincipalWhenMissing() throws Exception {
        PlatformPrincipal principal = new PlatformPrincipal(
                "user-1",
                "Alice",
                "alice@example.com",
                null,
                "google",
                Set.of("USER")
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSession(new MockHttpSession());
        request.getSession().setAttribute("platformPrincipal", principal);

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(principal, authentication.getPrincipal());
        assertEquals("ROLE_USER", authentication.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void shouldNotOverrideExistingAuthentication() throws Exception {
        PlatformPrincipal sessionPrincipal = new PlatformPrincipal(
                "user-1",
                "Alice",
                "alice@example.com",
                null,
                "google",
                Set.of("USER")
        );
        PlatformPrincipal existingPrincipal = new PlatformPrincipal(
                "user-2",
                "Bob",
                "bob@example.com",
                null,
                "local",
                Set.of("SUPER_ADMIN")
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSession(new MockHttpSession());
        request.getSession().setAttribute("platformPrincipal", sessionPrincipal);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(existingPrincipal, null, java.util.List.of())
        );

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(existingPrincipal, authentication.getPrincipal());
    }

    @Test
    void shouldNormalizeOAuthAuthenticationWithEmbeddedPlatformPrincipal() throws Exception {
        PlatformPrincipal principal = new PlatformPrincipal(
                "user-1",
                "Alice",
                "alice@example.com",
                null,
                "google",
                Set.of("USER")
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        new DefaultOAuth2User(
                                java.util.List.of(),
                                java.util.Map.of("platformPrincipal", principal, "sub", "google-subject-1"),
                                "sub"
                        ),
                        null,
                        java.util.List.of()
                )
        );

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(principal, authentication.getPrincipal());
        assertEquals("ROLE_USER", authentication.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void shouldNormalizeOAuthAuthenticationFromSessionPrincipalFallback() throws Exception {
        PlatformPrincipal principal = new PlatformPrincipal(
                "user-1",
                "Alice",
                "alice@example.com",
                null,
                "google",
                Set.of("USER")
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSession(new MockHttpSession());
        request.getSession().setAttribute("platformPrincipal", principal);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        new DefaultOAuth2User(
                                java.util.List.of(),
                                java.util.Map.of("sub", "google-subject-1"),
                                "sub"
                        ),
                        null,
                        java.util.List.of()
                )
        );

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        var authentication = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(authentication);
        assertEquals(principal, authentication.getPrincipal());
        assertEquals("ROLE_USER", authentication.getAuthorities().iterator().next().getAuthority());
    }

    @Test
    void shouldSkipWhenSessionPrincipalMissing() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();

        filter.doFilter(request, new MockHttpServletResponse(), new MockFilterChain());

        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
