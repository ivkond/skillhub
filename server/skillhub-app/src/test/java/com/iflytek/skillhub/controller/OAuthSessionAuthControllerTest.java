package com.iflytek.skillhub.controller;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.iflytek.skillhub.auth.rbac.PlatformPrincipal;
import com.iflytek.skillhub.auth.repository.UserRoleBindingRepository;
import com.iflytek.skillhub.auth.session.PlatformSessionService;
import com.iflytek.skillhub.domain.namespace.NamespaceMemberRepository;
import com.iflytek.skillhub.domain.user.UserAccount;
import com.iflytek.skillhub.domain.user.UserAccountRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OAuthSessionAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private PlatformSessionService platformSessionService;

    @MockBean
    private NamespaceMemberRepository namespaceMemberRepository;

    @MockBean
    private UserAccountRepository userAccountRepository;

    @MockBean
    private UserRoleBindingRepository userRoleBindingRepository;

    @Test
    void oauthSessionShouldAuthenticateMeEndpoint() throws Exception {
        PlatformPrincipal principal = new PlatformPrincipal(
                "oauth-user-1",
                "OAuth User",
                "oauth-user@example.com",
                null,
                "google",
                Set.of("USER")
        );
        given(namespaceMemberRepository.findByUserId("oauth-user-1")).willReturn(List.of());
        given(userAccountRepository.findById("oauth-user-1"))
                .willReturn(Optional.of(new UserAccount("oauth-user-1", "OAuth User", "oauth-user@example.com", null)));
        given(userRoleBindingRepository.findByUserId("oauth-user-1")).willReturn(List.of());

        Authentication upstreamAuthentication = new UsernamePasswordAuthenticationToken(
                new DefaultOAuth2User(
                        List.of(),
                        Map.of(
                                "platformPrincipal", principal,
                                "sub", "google-subject-1",
                                "email", "oauth-user@example.com"
                        ),
                        "sub"
                ),
                null,
                List.of()
        );

        MockHttpSession session = new MockHttpSession();
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setSession(session);

        platformSessionService.attachToAuthenticatedSession(principal, upstreamAuthentication, request);

        mockMvc.perform(get("/api/v1/auth/me").session(session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.userId").value("oauth-user-1"))
                .andExpect(jsonPath("$.data.oauthProvider").value("google"));
    }
}
