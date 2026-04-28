package com.iflytek.skillhub.auth.oauth;

import com.iflytek.skillhub.auth.rbac.PlatformPrincipal;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.Map;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;
import org.springframework.security.oauth2.core.oidc.OidcIdToken;
import org.springframework.security.oauth2.core.oidc.OidcUserInfo;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

/**
 * OIDC user-service bridge that mirrors OAuth2 mapping behavior and embeds the
 * resolved {@link PlatformPrincipal} into OIDC attributes for session setup.
 */
@Service
public class CustomOidcUserService implements OAuth2UserService<OidcUserRequest, OidcUser> {

    private final OAuthLoginFlowService oauthLoginFlowService;

    public CustomOidcUserService(OAuthLoginFlowService oauthLoginFlowService) {
        this.oauthLoginFlowService = oauthLoginFlowService;
    }

    @Override
    public OidcUser loadUser(OidcUserRequest request) throws OAuth2AuthenticationException {
        OAuthLoginFlowService.AuthenticatedLoginContext context = oauthLoginFlowService.loadOidcLoginContext(request);
        OidcUser upstreamUser = (OidcUser) context.upstreamUser();
        PlatformPrincipal principal = context.principal();

        var claims = new HashMap<>(upstreamUser.getClaims());
        claims.put("platformPrincipal", principal);
        OidcIdToken upstreamIdToken = upstreamUser.getIdToken();
        OidcIdToken idToken = new OidcIdToken(
                upstreamIdToken.getTokenValue(),
                upstreamIdToken.getIssuedAt(),
                upstreamIdToken.getExpiresAt(),
                claims
        );

        var authorities = new LinkedHashSet<GrantedAuthority>(upstreamUser.getAuthorities());
        principal.platformRoles().stream()
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role))
                .forEach(authorities::add);

        String userNameAttributeName = request.getClientRegistration()
                .getProviderDetails()
                .getUserInfoEndpoint()
                .getUserNameAttributeName();
        if (!StringUtils.hasText(userNameAttributeName)) {
            userNameAttributeName = IdTokenClaimNames.SUB;
        }

        OidcUserInfo userInfo = upstreamUser.getUserInfo();
        if (userInfo != null) {
            userInfo = enrichUserInfo(userInfo, principal);
            return new DefaultOidcUser(authorities, idToken, userInfo, userNameAttributeName);
        }
        return new DefaultOidcUser(authorities, idToken, userNameAttributeName);
    }

    private OidcUserInfo enrichUserInfo(OidcUserInfo upstreamUserInfo, PlatformPrincipal principal) {
        Map<String, Object> userInfoClaims = new HashMap<>(upstreamUserInfo.getClaims());
        userInfoClaims.put("platformPrincipal", principal);
        return new OidcUserInfo(userInfoClaims);
    }
}
