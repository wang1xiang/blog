---
title: "管理后台API迁移NestJS方案"
published: 2026-05-20
description: "当前管理后台（/admin-one 和 /admin 路由）的全部接口都在 one_enterprise_api（Java Spring Boot）中，但前端侧需要对这些接口进行更频繁的迭代和扩展。为避免前后端协作瓶颈，计划将管理后台..."
tags: ["杂项", "99-misc"]
category: "其他"
image: api
draft: true
---
# 管理后台 API 迁移至 NestJS 方案

> 提出时间：2026-04-17  
> 提出人：翔子（前端/Node）  
> 审阅对象：后端 leader

## 一、背景

当前管理后台（`/admin-one` 和 `/admin` 路由）的全部接口都在 `one_enterprise_api`（Java Spring Boot）中，但前端侧需要对这些接口进行更频繁的迭代和扩展。为避免前后端协作瓶颈，计划将管理后台的核心 API 抽离为独立的 Node.js（NestJS）项目，逐步替代 Java 后端中的对应接口。

## 二、迁移范围

先抽取 5 个路由组，共约 **93 个 endpoint**，涉及 **16 个 Java Controller**：

| 路由前缀 | Java Controller | endpoint 数 | 功能模块 |
|---|---|---|---|
| `/Team` | TeamMemberController, TeamDepartmentController, CompanyJobController, CompanyPositionController, PersonalDepartmentController, TeamMemberQuitController, TeamOfficeController, UserGroupController, ExcelServiceController | ~57 | 团队成员/部门/职位/岗位/离职/办公地点/用户组/Excel 导出 |
| `/team` | TeamInfoController, WorkSpaceController | ~13 | 企业信息/工作空间 |
| `/contact` | ContactController, ContactPersonalController, ContactUserGroupController | ~19 | 通讯录搜索/部门成员列表/规则配置/个人分组/用户组 |
| `/User` | InviteApplyController | 2 | 邀请申请 |
| `/subManager` | AppSubManagerController | 2 | 应用子管理员 |

**未包含的模块**：考勤、文档、知识库、会议、日程、电子签、统计日志等非核心管理接口，仍由 Java 端提供。

## 三、技术选型

| 层级 | 技术 | 说明 |
|---|---|---|
| 框架 | NestJS + TypeScript | 与 Spring 类似的依赖注入架构，便于后端同学理解 |
| ORM | Prisma | 替代 MyBatis-Plus，类型安全的查询 |
| 数据库 | MySQL | **共用现有 `lowcode` 库，不迁移数据** |
| 缓存 | Redis | 复用现有 Redis 实例 |
| 鉴权 | **复用现有 SSO gRPC 服务** | 不调用 HTTP SSO 接口，直接 gRPC 调用 |

## 四、鉴权方案（关键决策）

### 现有 Java 鉴权链路

```
请求 → RemoveVersionFilter (剥离 /v1/admin-one/ 前缀)
     → AuthorizationInterceptor
        → SSO gRPC 调用 (127.0.0.1:9207, SsoService.Verify)
           → 返回 user_uuid + team_uuid
        → 查本地 ddm_team_member 表获取 roleType
        → 注入 CurrentUser
```

### NestJS 复用方案

**直接复用同一个 SSO gRPC 服务**，不走 HTTP SSO 接口：

```
请求 → NestJS Middleware (剥离版本号前缀，同 Java)
     → AuthGuard
        → gRPC 调用 SsoService.Verify(token)
           → 地址: 127.0.0.1:9207
           → Proto: proto/sso.proto
           → 入参: VerifyParam { token }
           → 出参: VerifyResponse { status, data: Token { user_uuid, team_uuid } }
        → status === 0 时，查本地 ddm_team_member 表获取 roleType
        → 注入 Request (userUuid, teamUuid, roleType)
```

**Proto 定义**（`sso.proto`）：

```protobuf
service SsoService {
  rpc Verify(VerifyParam) returns (VerifyResponse);
}

message VerifyParam {
  string token = 1;
}

message VerifyResponse {
  int64 status = 1;     // 0 成功，非 0 失败
  string message = 2;
  Token data = 3;
}

message Token {
  string user_uuid = 1;
  string team_uuid = 6;
}
```

Node 端使用 `@grpc/grpc-js` + `@grpc/proto-loader` 实现调用，与 Java 端的 `@GrpcClient("sso-grpc-server")` 效果一致。

**优势**：
- 不需要重写 SSO 鉴权逻辑
- SSO 服务升级时两端自动同步
- token 格式、过期策略、登出逻辑全部由 SSO 统一管理

### 白名单机制

与 Java 端一致：
- `security.permiturls` 配置的路径跳过鉴权
- `@PublicAccess()` decorator 标记的接口跳过鉴权
- `@NoAdminVerification()` 标记的接口跳过后台权限校验

## 五、涉及的数据表

### 核心表（必须）

| 表名 | 用途 |
|---|---|
| `ddm_team_info` | 企业信息 |
| `ddm_team_member` | 团队成员（含 roleType、isBan、isUse 等） |
| `ddm_team_department` | 团队部门树 |
| `ddm_department_path` | 部门层级关系（path 查询优化） |
| `ddm_department_member` | 部门成员关联 |
| `ddm_company_job` | 职务 |
| `ddm_company_position` | 岗位 |
| `ddm_personal_department` | 个人创建的部门 |
| `ddm_user_group_type` | 用户组类型 |
| `ddm_user_group` | 用户组 |
| `ddm_user_group_member` | 用户组成员 |
| `ddm_team_office` | 办公地点 |
| `ddm_invite_apply` | 邀请申请 |
| `ddm_app_sub_manager` | 应用子管理员 |
| `ddm_contact_rule` | 通讯录规则配置 |

### 辅助表（按需）

| 表名 | 用途 |
|---|---|
| `ddm_team_member_quit` | 离职记录 |
| `ddm_workspace` / `ddm_space` / `ddm_space_member` | 工作空间 |
| `ddm_team_domain` | 团队域名配置 |
| `ddm_login_token` | 登录 token（降级鉴权用） |

## 六、现有 Java 服务中的外部依赖

NestJS 项目需要处理以下依赖：

| 依赖 | 来源 | NestJS 处理方式 |
|---|---|---|
| SSO 验证 | gRPC (127.0.0.1:9207) | ✅ 复用，`@grpc/grpc-js` 调用 |
| 用户信息 | `IUserInfoService`（需确认数据源） | ❓ 待确认：是否来自 gRPC 或其他服务 |
| Redis | 本地 Redis | ✅ 复用，`ioredis` 连接 |
| MySQL | 本地 MySQL | ✅ 复用，Prisma 连接 |

**待确认项**：

1. **`IUserInfoService` 数据来源**：Java 代码中大量调用此服务获取用户姓名、手机、头像等信息。需要确认数据来自哪里（gRPC 服务 / 另一张数据库表 / 外部 API）。如果也在 MySQL 中，需要补充对应的 Prisma model。

2. **gRPC 调用范围**：部分 endpoint 可能涉及其他 gRPC 服务（IM、日程、文档空间等）。需要确认本次 5 个路由组中哪些 endpoint 实际依赖了这些外部服务。

## 七、API 响应格式

保持与 Java 端一致的 `ResponseDTO` 格式：

```json
{
  "status": 0,
  "message": "ok",
  "data": { ... }
}
```

列表接口统一包装：
```json
{
  "status": 0,
  "message": "ok",
  "data": { "list": [...] }
}
```

失败响应：
```json
{
  "status": 1,
  "message": "错误信息",
  "data": {},
  "errDetail": { "uri": "...", "ip": "...", "qmpLogId": "..." }
}
```

## 八、URL 路由兼容

前端现有请求格式：`POST /v1/admin-one/Team/showTeamMember`

NestJS 中间件处理（复刻 Java `RemoveVersionFilter` 逻辑）：

```
/v1/admin-one/Team/showTeamMember  →  /Team/showTeamMember
/v1/admin-one/team/getTeamInfoBasic →  /team/getTeamInfoBasic
/enterprise/admin-one/contact/xxx   →  /contact/xxx (带 enterprise 标记)
```

配置规则（同 Java `application.base.yml`）：
```
^(/v\d+)?/(admin-one|app)/  →  /
/enterprise/admin-one/      →  /  (并标记 enterprise=true)
```

前端无需改动 URL，只需将 API 网关/反向代理指向新的 NestJS 服务即可。

## 九、项目结构

```
nestjs-admin/
├── prisma/
│   └── schema.prisma          # 数据库 schema
├── proto/
│   └── sso.proto              # SSO gRPC proto（从 Java 端拷贝）
├── src/
│   ├── main.ts                # 入口，端口 12000
│   ├── app.module.ts
│   ├── common/
│   │   ├── guards/auth.guard.ts           # SSO gRPC 鉴权
│   │   ├── filters/exception.filter.ts    # 全局异常处理
│   │   ├── interceptors/response.interceptor.ts
│   │   ├── decorators/public-access.decorator.ts
│   │   └── middlewares/url-prefix.middleware.ts  # URL 前缀剥离
│   ├── team/                  # /Team + /team 路由组
│   ├── contact/               # /contact 路由组
│   ├── user/                  # /User 路由组
│   └── sub-manager/           # /subManager 路由组
├── package.json
└── tsconfig.json
```

## 十、实施计划

| 阶段 | 内容 | 预估 |
|---|---|---|
| **P1** | 项目初始化、Prisma Schema、gRPC 连接配置、鉴权 Guard | 1-2 天 |
| **P2** | `/subManager` + `/User`（最简单，2+2 个 endpoint，验证链路） | 0.5 天 |
| **P3** | `/team`（企业信息，纯 DB 操作） | 1 天 |
| **P4** | `/contact`（通讯录，涉及多表关联查询） | 2-3 天 |
| **P5** | `/Team`（核心模块，57 个 endpoint，涉及外部服务调用最多） | 5-7 天 |
| **P6** | 联调验证、对比 Java/Node 响应一致性、性能测试 | 1-2 天 |

## 十一、风险与缓解

| 风险 | 影响 | 缓解 |
|---|---|---|
| `IUserInfoService` 数据源不明确 | 无法实现涉及用户详情的接口 | 优先确认，可能需要后端配合提供 gRPC 或 HTTP 接口 |
| 复杂 SQL 查询（如部门树 path 查询、子部门递归） | Prisma 可能无法直接表达 | 使用 `$queryRaw` 写原生 SQL，功能先行 |
| 并发写入导致的数据不一致（MySQL 共用） | Node 和 Java 同时操作同一库 | 后续迁移阶段注意事务隔离，当前阶段风险低 |
| gRPC 服务不可用 | 鉴权完全失效 | 降级到 Redis 查 `ddm_login_token` 表 |

## 十二、需要的后端配合

1. **确认 `IUserInfoService` 的数据来源和查询方式**（最关键）
2. **确认本次 5 个路由组中是否有 endpoint 依赖了其他 gRPC 服务**（IM、日程、文档等）
3. **确认 SSO gRPC 服务地址**（当前是 `127.0.0.1:9207`，生产环境可能不同）
4. **协助 review 关键 SQL 查询**（特别是部门树、权限相关的复杂查询）
