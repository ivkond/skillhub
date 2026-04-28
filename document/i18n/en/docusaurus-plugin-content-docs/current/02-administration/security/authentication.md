---
title: Authentication Configuration
sidebar_position: 1
description: Configure user authentication methods
---

# Authentication Configuration

SkillHub supports multiple authentication methods to meet different enterprise security requirements.

## OAuth2 Login

### GitHub OAuth

1. Create an OAuth App on GitHub
2. Configure environment variables:
   ```bash
   OAUTH2_GITHUB_CLIENT_ID=your-client-id
   OAUTH2_GITHUB_CLIENT_SECRET=your-client-secret
   ```

### Google OAuth

1. Create an OAuth Client in Google Cloud Console.
2. Configure backend properties:
   ```properties
   spring.security.oauth2.client.registration.google.client-id=${OAUTH2_GOOGLE_CLIENT_ID}
   spring.security.oauth2.client.registration.google.client-secret=${OAUTH2_GOOGLE_CLIENT_SECRET}
   spring.security.oauth2.client.registration.google.scope=openid,profile,email
   spring.security.oauth2.client.registration.google.redirect-uri={baseUrl}/login/oauth2/code/google
   ```
3. Add Google redirect URI in provider console:
   - `{baseUrl}/login/oauth2/code/google`
4. Verify provider contracts from backend:
   - `/api/v1/auth/providers` contains provider `google`
   - `/api/v1/auth/methods` contains method `oauth-google` with action URL `/oauth2/authorization/google`

### Extend OAuth Provider

The architecture supports extending to other OAuth providers like GitLab, Gitee, etc.

## Local Account Login

Local account login is supported in development environment, disabled by default in production.

## Enterprise SSO Integration

Supports integrating enterprise SSO (SAML/OIDC) through extension points.

## Next Steps

- [Authorization](./authorization) - Configure access control
