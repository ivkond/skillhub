---
title: Authenticated APIs
sidebar_position: 3
description: APIs requiring authentication
---

# Authenticated APIs

## Authentication Related

### Get Current User

```http
GET /api/v1/auth/me
```

### Logout

```http
POST /api/v1/auth/logout
```

## Skill Publishing

```http
POST /api/v1/publish
Content-Type: multipart/form-data

file: <zip-file>
namespace: <namespace-slug>
```

## Favorites

```http
POST /api/v1/skills/{namespace}/{slug}/star
DELETE /api/v1/skills/{namespace}/{slug}/star
```

## Ratings

```http
POST /api/v1/skills/{namespace}/{slug}/rating
Content-Type: application/json

{
  "score": 5
}
```

## Tag Management

```http
GET /api/v1/skills/{namespace}/{slug}/tags
PUT /api/v1/skills/{namespace}/{slug}/tags/{tagName}
DELETE /api/v1/skills/{namespace}/{slug}/tags/{tagName}
```

## My Resources

```http
GET /api/v1/me/stars
GET /api/v1/me/skills
```

## Namespace Management

```http
POST /api/v1/namespaces
PUT /api/v1/namespaces/{slug}
GET /api/v1/namespaces/{slug}/members
POST /api/v1/namespaces/{slug}/members
PUT /api/v1/namespaces/{slug}/members/{userId}/role
DELETE /api/v1/namespaces/{slug}/members/{userId}
```

## Reviews

```http
GET /api/v1/namespaces/{slug}/reviews
POST /api/v1/namespaces/{slug}/reviews/{id}/approve
POST /api/v1/namespaces/{slug}/reviews/{id}/reject
```

## Promotion Requests

```http
POST /api/v1/namespaces/{slug}/skills/{skillId}/promote
```

## Collections APIs (Authenticated)

Collections APIs cover creation, detail reads, collaborator management, skill membership changes, and public-share access. The permission model follows `owner / contributor / stranger / admin`:

- `owner`: creator of the collection, full write privileges
- `contributor`: can manage skill membership, but cannot change collection metadata/visibility
- `stranger`: no write privileges
- `admin`: governance role with elevated cross-collection operations

Core web routes:

```http
GET    /api/web/collections
POST   /api/web/collections
GET    /api/web/collections/{id}
PATCH  /api/web/collections/{id}
DELETE /api/web/collections/{id}

POST   /api/web/collections/{id}/contributors
DELETE /api/web/collections/{id}/contributors/{userId}

POST   /api/web/collections/{id}/skills
DELETE /api/web/collections/{id}/skills/{skillId}

GET    /api/web/users/{ownerId}/collections/{slug}   # public/share route
```

Visibility and safety expectations:

- `PRIVATE` collections return not-found style responses to unauthorized viewers to avoid leaking collection or skill metadata
- write routes are server-side role guarded (owner/admin baseline, contributor for selected membership actions)
- public share links return full payload only when visibility allows it

## API Token

```http
POST /api/v1/tokens
GET /api/v1/tokens
DELETE /api/v1/tokens/{id}
```

## Next Steps

- [CLI Compatibility Layer](./cli-compat) - ClawHub compatible endpoints
