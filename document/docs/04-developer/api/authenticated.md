---
title: 认证 API
sidebar_position: 3
description: 需要认证的 API
---

# 认证 API

## 认证相关

### 获取当前用户

```http
GET /api/v1/auth/me
```

### 登出

```http
POST /api/v1/auth/logout
```

## 技能发布

```http
POST /api/v1/publish
Content-Type: multipart/form-data

file: <zip-file>
namespace: <namespace-slug>
```

## 收藏

```http
POST /api/v1/skills/{namespace}/{slug}/star
DELETE /api/v1/skills/{namespace}/{slug}/star
```

## 评分

```http
POST /api/v1/skills/{namespace}/{slug}/rating
Content-Type: application/json

{
  "score": 5
}
```

## 标签管理

```http
GET /api/v1/skills/{namespace}/{slug}/tags
PUT /api/v1/skills/{namespace}/{slug}/tags/{tagName}
DELETE /api/v1/skills/{namespace}/{slug}/tags/{tagName}
```

## 我的资源

```http
GET /api/v1/me/stars
GET /api/v1/me/skills
```

## 命名空间管理

```http
POST /api/v1/namespaces
PUT /api/v1/namespaces/{slug}
GET /api/v1/namespaces/{slug}/members
POST /api/v1/namespaces/{slug}/members
PUT /api/v1/namespaces/{slug}/members/{userId}/role
DELETE /api/v1/namespaces/{slug}/members/{userId}
```

## 审核

```http
GET /api/v1/namespaces/{slug}/reviews
POST /api/v1/namespaces/{slug}/reviews/{id}/approve
POST /api/v1/namespaces/{slug}/reviews/{id}/reject
```

## 提升申请

```http
POST /api/v1/namespaces/{slug}/skills/{skillId}/promote
```

## 集合（Collections）API（需登录）

集合 API 覆盖创建、详情读取、成员协作、技能成员维护与公开访问场景。默认采用 `owner / contributor / stranger / admin` 角色模型：

- `owner`：集合创建者，拥有全部写权限
- `contributor`：可维护集合内技能成员，但不能改集合元信息与可见性
- `stranger`：无授权写权限
- `admin`：治理角色，可跨集合执行管理操作

核心路由（Web Portal）：

```http
GET    /api/web/me/collections
POST   /api/web/collections
GET    /api/web/collections/{id}
PATCH  /api/web/collections/{id}
DELETE /api/web/collections/{id}

POST   /api/web/collections/{id}/contributors
DELETE /api/web/collections/{id}/contributors/{userId}

POST   /api/web/collections/{id}/skills
DELETE /api/web/collections/{id}/skills/{skillId}

GET    /api/web/public/collections/{ownerId}/{slug}   # 公开/分享（Web）
GET    /api/v1/public/collections/{ownerId}/{slug}   # 公开/分享（JSON）
```

可见性与安全约束：

- `PRIVATE` 集合对未授权访问者返回 not-found 样式响应，避免泄露集合与技能元信息
- 集合写操作必须通过服务端角色校验（owner/admin 为主，部分成员操作开放 contributor）
- 公开分享链接仅在集合可见性允许时返回完整内容

## API Token

```http
POST /api/v1/tokens
GET /api/v1/tokens
DELETE /api/v1/tokens/{id}
```

## 下一步

- [CLI 兼容层](./cli-compat) - ClawHub 兼容接口
