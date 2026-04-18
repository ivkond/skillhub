package com.iflytek.skillhub.auth.session;

import com.iflytek.skillhub.auth.rbac.PlatformPrincipal;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Rehydrates Spring Security authentication from the durable session principal
 * when the serialized security context is unavailable.
 */
@Component
public class SessionPrincipalAuthenticationFilter extends OncePerRequestFilter {

    private final PlatformSessionService platformSessionService;

    public SessionPrincipalAuthenticationFilter(PlatformSessionService platformSessionService) {
        this.platformSessionService = platformSessionService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        Object sessionPrincipal = request.getSession(false) != null
                ? request.getSession(false).getAttribute("platformPrincipal")
                : null;
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null
                && !(authentication.getPrincipal() instanceof PlatformPrincipal)) {
            PlatformPrincipal principal = null;
            if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
                Object embeddedPrincipal = oauth2User.getAttributes().get("platformPrincipal");
                if (embeddedPrincipal instanceof PlatformPrincipal platformPrincipal) {
                    principal = platformPrincipal;
                }
            }
            if (principal == null && sessionPrincipal instanceof PlatformPrincipal platformPrincipal) {
                principal = platformPrincipal;
            }
            if (principal != null) {
                platformSessionService.attachToAuthenticatedSession(principal, authentication, request, false);
            }
        } else if (authentication == null) {
            if (sessionPrincipal instanceof PlatformPrincipal platformPrincipal) {
                platformSessionService.establishSession(platformPrincipal, request, false);
            }
        }
        filterChain.doFilter(request, response);
    }
}
