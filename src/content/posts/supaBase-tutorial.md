---
title: supaBase学习笔记
published: 2025-05-18T16:00:00.000Z
description: supaBase学习笔记
tags:
  - work
category: work
author: 翔子
---

## 是什么

**The open source Firebase alternative.**

目标是将后端服务抽象为可直接调用的 API

## 核心功能

### [数据库](https://supabase.com/docs/guides/database/overview)

1. PostgreSQL

   提供完全托管的 PostgreSQL 数据库，每个 Supabase 项目都配备一个完整的 Postgres 数据库，支持[SQL 语法](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/sql/new)和[图形化操作](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/editor)

2. 自动生成 API

   根据表结构自动生成 RESTful & GraphQL API

### [身份认证（Authentication）](https://supabase.com/docs/guides/auth)

1. [多方式登录](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/auth/providers)

   支持邮箱/密码、社交登录（Google/GitHub 等）、Magic Link、手机号验证等，无需自建用户体系。

   ```js
   // 邮箱登录示例
   const { user, error } = await supabase.auth.signInWithPassword({
     email: 'test@example.com',
     password: 'xxxxxx',
   })
   ```

2. [行级安全（RLS）](https://supabase.com/docs/guides/database/postgres/row-level-security)

   基于 PostgreSQL 的行级安全策略，控制用户数据访问权限，例如，可以限制不同用户对同一张表的不同数据行的访问权限

   ```sql
   -- 仅允许用户访问自己的数据
    create policy "User can read own profile"
    on users for select
    using (auth.uid() = id);
   ```

### [存储（Storage）](https://supabase.com/docs/guides/storage)

文件托管：支持上传、下载、管理文件（图片、视频等），自动生成 CDN 加速链接。

```js
// 上传文件示例
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('user1.png', file)
```

### [实时订阅（Realtime）](https://supabase.com/docs/guides/realtime)

使用[Realtime Server](https://github.com/supabase/realtime)扩展了 Postgres 的实时功能
WebSocket 支持：监听数据库变更事件（INSERT/UPDATE/DELETE），实现实时数据同步。

```js
// 订阅用户表变更
const subscription = supabase
  .channel('user-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'users',
    },
    (payload) => {
      console.log('数据变更:', payload)
    }
  )
  .subscribe()
```

### serverless Functions

- 数据库函数[DataBase Function](https://supabase.com/docs/guides/database/functions)

  顾名思义，应该和数据库相关，在数据库内部执行的，可能用 SQL 或 PL/pgSQL 编写，用于数据操作、复杂查询（如多表联查、聚合计算）等

  通过 rpc 调用

- [边缘函数](https://supabase.com/docs/guides/functions)

  使用 TypeScript/JavaScript 编写，可以用于处理数据库敏感操作（增删数据）、也可以处理一些相比数据库 CRUD 更复杂的逻辑（如支付回调、数据清洗），完全不需要部署后端代码了

  通过 invoke 调用

## [Supabase CLI](https://supabase.com/docs/guides/local-development)

Supabase 本地开发，在本地计算机上的独立环境中处理项目，需要 Docker 环境

- supabase init：初始化本地项目，生成 supabase/config.toml 以及 migrations、functions、tests 等目录
- supabase login：登录 Supabase，自动打开浏览器，输入对应的 verification code 登陆，显示登陆成功
- supabase start / supabase stop：用 Docker 启动／停止完整的 Supabase 本地环境，一步到位
- supabase migration：管理数据库迁移，让 schema 变更更可控
- supabase db push：把本地 schema/函数直接推到你在 Supabase 平台上的数据库（很适合 CI/CD
- supabase projects：查、建、删 Supabase 项目
- supabase gen types：一键从数据库生成 TypeScript 类型定义，前端调用接口更安心
- supabase completion：帮你生成 Shell 补全脚本，不用每次记命令格式

### 使用 CLI 连接 Supabase 远程项目

**前提：本地 docker 环境正确部署**

执行 supabase init 完成初始化后，连接到远程的 Supabase 项目步骤如下：

1. 登录/退出 Supabase 账户

   ```bash
   supabase login
   supabase logout
   ```

   执行此命令后，浏览器会自动打开并要求您授权 CLI 访问您的 Supabase 账户。

2. 获取项目引用 ID

   从 Supabase 仪表板获取项目的引用 ID，在[项目设置](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/settings/general)中找到，通常是一个类似 abcdefghijklmnopqrst 的字符串。

   或者使用命令获取项目引用 ID

   ```bash
   supabase projects list
   ```

3. 链接/取消链接远程项目

   ```bash
   supabase link --project-ref 您的项目引用ID
   supabase unlink
   ```

4. 验证登陆状态

   ```bash
   supabase status
   ```

### Supabase CLI 与 Docker

Supabase CLI 是一个命令行工具，用于管理 Supabase 项目。根据不同的使用场景，对 Docker 的依赖程度不同：

#### 需要 Docker 的场景

1. 本地开发环境

   - supabase start：在本地启动完整的 Supabase 开发环境
   - supabase db：数据库相关操作（如 db pull , db push , db diff ）
   - supabase gen types：生成数据库类型定义
   - supabase functions serve：本地测试 Edge Functions

2. Edge Functions 开发

   - 开发、测试和部署 Edge Functions 时需要 Docker
   - Docker 用于模拟 Deno 运行环境，确保本地测试与生产环境一致

3. 数据库迁移

   - 创建、应用和回滚数据库迁移时需要 Docker

### 不需要 Docker 的场景

1. 项目管理

   - supabase login：登录 Supabase 账户
   - supabase projects list：列出项目
   - supabase link：链接到远程项目

2. 部署操作

   - supabase functions deploy：部署 Edge Functions（仅需将代码上传到远程服务器）
   - supabase secrets list/set：管理环境变量

3. 基本配置

   - supabase init：初始化项目配置文件

## [Supabase SDK](https://supabase.com/docs/reference/javascript/introduction)

### 依赖安装

```bash
npm install @supabase/supabase-js
```

[api 文档](https://supabase.github.io/supabase-js/v2/modules/index.html)

### 初始化

1. 配置 supabase 环境变量

   ```text
   // env.local
   VITE_SUPABASE_URL=<SUBSTITUTE_SUPABASE_URL>
   VITE_SUPABASE_ANON_KEY=<SUBSTITUTE_SUPABASE_ANON_KEY>
   ```

   例如 AI-Agent 查项目 Project：

   ```js
   url: 'https://xwizhxzutcmpanozdpja.supabase.co'
   anon_key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh3aXpoeHp1dGNtcGFub3pkcGphIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDczOTI4NzksImV4cCI6MjA2Mjk2ODg3OX0.8Hg1eMyBGhJbi-8Bq7QCYXVnienRyqwjd5EqXPQced0'
   ```

2. 创建 Supabase 客户端

   可以通过匿名密钥或服务角色密钥创建 Supabase 客户端

   ```js
   // src/lib/supabaseClient.js
   import { createClient } from '@supabase/supabase-js'
   const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
   const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

   // 使用 createClient() 方法初始化一个新的 Supabase 客户端
   export const supabase = createClient(supabaseUrl, supabaseAnonKey)
   ```

   ```js
   export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
     // 自定义accessToken 是headers authorization
     accessToken: () => Promise.resolve(''),
     // 自定义headers
     global: {
       headers: {
         'x-my-custom-header': 'my-app-name',
       },
     },
   })
   ```

   更多参数参考[createClient](https://supabase.github.io/supabase-js/v2/modules/index.html#createClient)

### 密钥

- 匿名密钥

  服务于客户端代码，本身就是可以公开，Supabase 的安全模型不依赖于保持这个密钥的私密性

- 服务角色密钥

  服务于服务器端代码，具有管理员权限，可以绕过行级安全（RLS）策略，必须保密

#### 对比

| 特性       | 匿名密钥 (Anon Key) | 服务角色密钥 (Service Role Key) |
| ---------- | ------------------- | ------------------------------- |
| 权限级别   | 受限，遵循 RLS 策略 | 管理员级别，可绕过 RLS          |
| 使用位置   | 客户端代码          | 服务器端代码 Edge Function      |
| 安全性要求 | 可以公开            | 必须保密                        |
| 适用场景   | 普通用户操作(查看)  | 管理操作、批量处理              |

#### 最佳实践

1. 始终设置 RLS 策略

   使用匿名密钥仅允许前端进行有限操作（如公开数据读取）

2. 对于需要更高权限的操作，使用服务器端代码和服务角色密钥

   敏感操作（如写入、删除）应通过 Edge Functions 或后端服务处理

3. 设置域名限制

   在 Supabase 控制台中限制可以使用匿名密钥的域名

**查看在客户端，增删改在服务端**

如，删除用户

1. 在服务端，定义删除用户边缘函数

   ```js
   import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
   import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

   // 定义 CORS 头
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*', // 或者指定您的域名
     'Access-Control-Allow-Headers':
       'authorization, x-client-info, apikey, content-type',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
   }

   serve(async (req) => {
     // 处理 OPTIONS 预检请求
     if (req.method === 'OPTIONS') {
       return new Response('ok', { headers: corsHeaders })
     }

     try {
       const { id } = await req.json()

       if (!id) {
         return new Response(JSON.stringify({ error: '缺少用户ID' }), {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 400,
         })
       }

       // 使用服务角色密钥创建 Supabase 客户端
       const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
       const supabaseServiceKey =
         Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
       const supabase = createClient(supabaseUrl, supabaseServiceKey)

       // 执行删除操作
       const { error } = await supabase.from('test').delete().eq('id', id)

       if (error) throw error

       return new Response(JSON.stringify({ success: true }), {
         headers: { ...corsHeaders, 'Content-Type': 'application/json' },
         status: 200,
       })
     } catch (error) {
       return new Response(
         JSON.stringify({ error: error.message || '删除用户数据失败' }),
         {
           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
           status: 500,
         }
       )
     }
   })
   ```

2. 客户端通过 invoke 调用边缘函数

   ```js
   export const deleteUser = async (id: number) => {
     try {
       const { data, error } = await supabase.functions.invoke('delete-user', {
         body: { id }
       })

       if (error) throw error
       return true
     } catch (error: any) {
       throw new Error(error.message || "删除用户数据失败")
     }
   ```

3. 调用记录，可以知道是谁删除的用户

   ![alt text](image-1.png)
   ![alt text](image-2.png)

4. 可以添加[用户日志](https://supabase.com/docs/guides/functions/logging)

   ```js
   serve(async (req)=>{
      // 处理 OPTIONS 预检请求
      if (req.method === 'OPTIONS') {
        return new Response('ok', {
          headers: corsHeaders
        });
      }
      let headersObject = Object.fromEntries(req.headers);
      let requestHeaders = JSON.stringify(headersObject, null, 2);
      console.log(`Request headers: ${requestHeaders}`);
   ```

   ![alt text](image-3.png)

### TypeScript 支持

- NOT NULL 列会被推断为非空类型，NULL 列则为 T | null。
- 自动生成类型 ：Supabase 可以根据数据库模式自动生成 TypeScript 类型定义

#### 生成 types

##### Supabase CLI

[Generating TypeScript Types](https://supabase.com/docs/guides/api/rest/generating-types)

```bash
npx supabase gen types typescript \
  --project-id <your-project-id> \
  --schema public \
  > database.types.ts
```

##### [直接导出](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/api?page=tables-intro)

1. 类型声明文件 结构

   ```ts
   export type Json = string | number | boolean | ... // JSON 类型兼容支持

   export interface Database {
     public: {
       Tables: {
         your_table_name: {
           Row: { ... }       // 查询时的字段
           Insert: { ... }    // 插入时的字段（可省略的字段为 optional）
           Update: { ... }    // 更新时的字段（全 optional）
         }
       }
       Views: { ... }        // 如有视图也会生成
       Functions: { ... }    // 存储函数定义
     }
   }
   ```

2. 项目中导入生成的 supabase-types.ts，然后在初始化 Supabase 客户端时传入类型参数

   ```ts
   import { createClient } from '@supabase/supabase-js'
   import { Database } from './supabase-types'

   const supabase = createClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
   )
   ```

   之后，所有 .from().select()、.insert()、.update() 等方法均拥有严格的类型约束和自动补全

3. 可直接从生成的 database.types.ts 中引入类型

   ```ts
   import { Users } from './database.types'

   const { data, error } = await supabase.from<Users>
   'users'.select('id, name').eq('email', 'test@example.com')
   ```

4. 自定义类型与覆盖

   可以定义接口或类型，覆盖自动生成的类型

   ```ts
   interface CustomUser extends Users {
     isAdmin?: boolean
   }
   const { data } = await supabase.from<CustomUser>('users').select('*')
   ```

5. 复杂查询的响应类型

   在 Supabase 的 TypeScript 支持中，针对“多表关联查询”这类复杂场景，提供了三个辅助类型：

   - `QueryResult<T, E>`

     ```ts
     interface QueryResult<T = any, E = PostgrestError> {
       data: T | null
       error: E | null
       // …还有 count、status 等字段
     }
     ```

   - `QueryData<Q>`

     从一个查询构造出的成功返回值类型

   - `QueryError<Q>`

   ```ts
   import { QueryResult, QueryData, QueryError } from '@supabase/supabase-js'

   const countriesWithCitiesQuery = supabase.from('countries').select(`
       id,
       name,
       cities ( id, name )
     `)

   // 1 得到强类型的 QueryResult
   type R = QueryResult<
     QueryData<typeof countriesWithCitiesQuery>,
     QueryError<typeof countriesWithCitiesQuery>
   >

   // 2 从类型安全的查询中解构 data 和 error
   const { data, error }: R = await countriesWithCitiesQuery
   if (error) throw error

   // 3 data 的类型已知为 CountriesWithCities
   type CountriesWithCities = QueryData<typeof countriesWithCitiesQuery>
   const countriesWithCities: CountriesWithCities = data!
   ```

### [Auth](https://supabase.com/docs/reference/javascript/auth-api)

Supabase 采用 JWT（JSON Web 令牌） 和 密钥认证（Key Auth） 相结合的鉴权方式。其运作逻辑如下：

1. 无认证头时

   若请求中未包含 Authorization 请求头，API 将默认以 匿名用户（anonymous user） 身份处理请求（此角色默认权限有限，需通过 RLS 策略控制数据访问）

2. 携带认证头时

   登陆后会生成 JWT，标识和授权已登录的用户，包含用户身份信息，有过期时间，用于维持用户会话状态

   若请求包含有效的 Authorization 头（如 `Bearer <JWT>` 或 Apikey <密钥>），API 将：

   - 身份切换：自动切换到对应令牌所属的用户角色
   - 权限继承：基于该用户的权限执行操作（受 RLS 策略约束）

注册、登陆、查看用户信息、退出等

### 数据库操作

1. [提供增、删、改、查等基础操作](https://supabase.com/docs/reference/javascript/select)
2. [调用 Postgres 函数](https://supabase.com/docs/reference/javascript/rpc)：调用
3. [过滤器](https://supabase.com/docs/reference/javascript/using-filters)：仅返回符合特定条件的行，如等于、包含等
4. [修饰符](https://supabase.com/docs/reference/javascript/using-modifiers)：修饰符必须在过滤器后指定，如排序、分页等
5. 联查

   - Supabase 表关系通过 `!` 符号后跟外键名称来指定的，默认为 LEFT JOIN

     ```js
     supabase.from('product_list').select(`
        *,
        related_table!related_table_id(*)
        `)
     ```

   - 如果外键名称与被引用的主键名称相同，可以不用写 `related_table(*)`
   - 内连接（INNER JOIN）

     ```js
     // !inner 表示内连接（INNER JOIN）
     supabase.from('product_list').select(`
        *,
        related_table!inner(*)
        `)
     ```

     - 返回结果为

       ```js
       ;[
         {
           id: 1,
           name: 'xx',
           // 其他 user 表字段...
           related_table: {
             id: 'xx',
             name: '张三',
           },
         },
         // 更多用户记录...
       ]
       ```

## vue 快速入门

[通过邮箱注册登陆](https://supabase.com/docs/guides/auth/passwords?queryGroups=language&language=js)

- supabase.auth.signUp
- supabase.auth.verifyOtp
- supabase.auth.signInWithPassword

[接收邮件模版配置](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/auth/templates)

## 打通默认的 auth.users 表（身份认证表）和自定义的 user 表（业务用户表）

1. 创建业务用户表

   ```sql
    -- 在 Supabase SQL 编辑器中执行
      create table public.user (
        id uuid references auth.users(id) primary key, -- 外键关联
        username text unique,
        avatar_url text,
        created_at timestamp with time zone default now()
      );
   ```

2. 设置行级安全（RLS）

   ```sql
   -- 允许用户仅访问自己的数据
   alter table public.user enable row level security;

   create policy "用户只能管理自己的数据"
   on public.user
   for all using (auth.uid() = id);
   ```

3. 自动同步用户创建事件

   - 使用数据库触发器

     ```sql
      -- 当 auth.users 插入新用户时，自动创建 public.user 记录
     create or replace function public.handle_new_user()
     returns trigger as $$
     begin
      insert into public.user (id, username)
      values (new.id, new.email); -- 初始用户名设为邮箱
      return new;
     end;
     $$ language plpgsql security definer;

     -- 绑定触发器
     drop trigger if exists on_auth_user_created on auth.users;
     create trigger on_auth_user_created
      after insert on auth.users
      for each row execute procedure public.handle_new_user();
     ```

   - 客户端代码同步

     ```js
     // 用户注册成功后，手动插入数据到 public.user
     const {
       data: { user },
       error,
     } = await supabase.auth.signUp({
       email: 'user@example.com',
       password: 'password123',
     })

     if (user) {
       await supabase.from('user').insert({
         id: user.id,
         username: user.email,
       })
     }
     ```

## 遇到问题

1. 查询结果为空数组

   之所以会得到空数组，是因为 Supabase 为每张表启动 [Row Level Security](https://www.postgresql.org/docs/current/ddl-rowsecurity.html) 策略，我们回到 [Supabase Dashboard](https://supabase.com/dashboard)，打开右侧菜单[Authentication - Policies](https://supabase.com/dashboard/project/xwizhxzutcmpanozdpja/auth/policies)，可以看到在表的安全策略中有个提示：

   ![alt text](image.png)

   翻译就是：`已为此表启用行级别安全性，但未设置任何策略，选择查询将返回一个空的结果数组。`

   知道原因后，我们需要配置一个安全策略，点击右侧的 `Create policy`，这里我们只需要放开 `Select` 查询的权限就行，它会绕过 Row Level Security 策略：

2. Edge Functions 报 CORS error

   需要在函数中设置请求头

   ```js
   // 定义 CORS 头
   const corsHeaders = {
     'Access-Control-Allow-Origin': '*', // 或者指定您的域名
     'Access-Control-Allow-Headers':
       'authorization, x-client-info, apikey, content-type',
     'Access-Control-Allow-Methods': 'POST, OPTIONS',
   }
   ```

3. 部署的服务传递 Authorization Header 报 401 Unauthorized

   ```js
   // Authorization置空
   accessToken: () => Promise.resolve(''),
   ```

4. 部署的服务 SUPABASE_URL、SUPABASE_SERVICE_ROLE_KEY 获取不到

   环境变量问题、查看 edge function 日志 docker logs supabase-edge-functions

5. 报错 JWSError JWSInvalidSignature

   查库时报错

   ```js
   const supabase = createClient(supabaseUrl, supabaseKey)

   // 查询 product_list 表
   let { data: product_list, error } = await supabase.from('product_list')
   ```

   [解决方案 1](https://github.com/supabase/supabase/issues/17164)**未解决**
   [解决方案 2](https://github.com/supabase/supabase/issues/17164#issuecomment-2280835849)

   [官网生成 API keys](https://supabase.com/docs/guides/self-hosting/docker#generate-api-keys)对自部署的服务有 bug

   ```js
   import { KJUR } from 'jsrsasign'
   import crypto from 'crypto'

   const JWT_HEADER = { alg: 'HS256', typ: 'JWT' }
   const now = new Date()
   const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
   const fiveYears = new Date(
     now.getFullYear() + 5,
     now.getMonth(),
     now.getDate()
   )

   const anonToken = `
      {
        "role": "anon",
        "iss": "qmp_supabase",
        "iat": ${Math.floor(today.valueOf() / 1000)},
        "exp": ${Math.floor(fiveYears.valueOf() / 1000)}
      }
      `.trim()

   const serviceToken = `
      {
        "role": "service_role",
        "iss": "qmp_supabase",
        "iat": ${Math.floor(today.valueOf() / 1000)},
        "exp": ${Math.floor(fiveYears.valueOf() / 1000)}
      }
      `.trim()

   const generateRandomString = (length) => {
     const CHARS =
       'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
     let result = ''
     const MAX = Math.floor(256 / CHARS.length) * CHARS.length - 1
     const randomUInt8Array = new Uint8Array(1)
     for (let i = 0; i < length; i++) {
       let randomNumber
       do {
         crypto.getRandomValues(randomUInt8Array)
         randomNumber = randomUInt8Array[0]
       } while (randomNumber > MAX)
       result += CHARS[randomNumber % CHARS.length]
     }
     return result
   }

   const jwt_secret_key = generateRandomString(128)
   const anonTokenSigned = KJUR.jws.JWS.sign(
     null,
     JWT_HEADER,
     anonToken,
     jwt_secret_key
   )
   const serviceTokenSigned = KJUR.jws.JWS.sign(
     null,
     JWT_HEADER,
     serviceToken,
     jwt_secret_key
   )
   console.log(`JWT_SECRET=${jwt_secret_key}`)
   console.log(`ANON_KEY=${anonTokenSigned}`)
   console.log(`SERVICE_ROLE_KEY=${serviceTokenSigned}`)
   ```

6. 自部署服务无法使用 Email/password 登陆

   ```js
   // .enb
   ENABLE_PHONE_SIGNUP = true
   ```

7. 目前只能访问 public schema 下的库

   ```js
   // .env
   ;(PGRST_DB_SCHEMAS = public), storage, graphql_public, xxx
   ```

   ```js
   // supabaseClient.js
   export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      db: {
        schema: 'xxx'
      },
   ```

   **未解决:permission denied for schema xxx**

8. 获取所有表/表中的字段属性

   创建 database functions

   ```sql
   create or replace function get_tables()
    returns table (table_name text)
    language plpgsql
    as $$
    begin
      return query
      select t.table_name::text
      from information_schema.tables t
      where t.table_schema = 'public'
      and t.table_type = 'BASE TABLE';
    end;
    $$;
   ```

   ```sql
   create or replace function get_table_columns(p_table_name text)
    returns table (
      column_name text,
      data_type text,
      is_nullable boolean,
      column_default text
    )
    language plpgsql
    as $$
    begin
      return query
      select
        c.column_name::text,
        c.data_type::text,
        c.is_nullable::boolean,
        c.column_default::text
      from information_schema.columns c
      where c.table_schema = 'public'
      and c.table_name = p_table_name;
    end;
    $$;
   ```

   通过 rpc 调用 `await supabase.rpc('get_tables')`、`await supabase.rpc('get_table_columns', { p_table_name: 'your_table_name' })`

9.

## 小结

解放后端：Supabase 将 PostgreSQL、自动生成的 REST/GraphQL API、Auth、Storage、Realtime 等能力封装好，让前端直接对接数据库和云函数，不依赖后端。

快速迭代：通过 Supabase Studio 可视化建表，前端可自主搭建 CRUD 功能模块，提高开发速度。

可扩展：需要更复杂的业务逻辑，还可以用 Edge Functions 来实现补丁功能。
