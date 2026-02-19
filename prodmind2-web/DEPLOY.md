# ProdMind 2.0 Web 部署指南

## 前置条件

- Node.js 18+
- Supabase 项目（免费版即可）
- Vercel 账号
- 至少一个 AI Provider API Key（OpenAI / DeepSeek 等）

## 1. Supabase 配置

### 创建项目

1. 访问 https://supabase.com → New Project
2. 记录 Project URL 和 anon key（Settings → API）

### 执行数据库迁移

在 Supabase SQL Editor 中执行 `supabase/migrations/001_initial_schema.sql` 的全部内容。

### 开启 Realtime

在 Supabase Dashboard → Database → Replication 中，为以下表开启 Realtime：

- `sessions`
- `assumptions`
- `risks`
- `agent_comments`
- `snapshots`

### 配置 Auth

Settings → Authentication：
- 启用 Email 登录
- Site URL 设为你的域名（如 `https://your-app.vercel.app`）
- Redirect URLs 添加 `https://your-app.vercel.app/auth/callback`

## 2. 本地开发

```bash
cd prodmind2-web
npm install

# 复制环境变量
cp .env.local.example .env.local
# 编辑 .env.local，填入 Supabase URL 和 anon key
```

```bash
npm run dev
```

访问 http://localhost:3000，注册账号后在「设置」页配置 AI Provider。

## 3. Vercel 部署

### 方式一：CLI 部署

```bash
npm i -g vercel
cd prodmind2-web
vercel
```

### 方式二：Git 集成

1. 将代码推送到 GitHub
2. Vercel Dashboard → Import Project → 选择仓库
3. Root Directory 设为 `prodmind2-web`
4. Framework Preset: Next.js

### 环境变量

在 Vercel 项目 Settings → Environment Variables 中添加：

| 变量名 | 值 |
|--------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 项目 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |

### 部署后

1. 将 Vercel 分配的域名添加到 Supabase Auth 的 Redirect URLs
2. 更新 Supabase Auth 的 Site URL

## 4. AI Provider 配置

部署完成后，每个用户需在「设置」页面配置：

1. **Provider**：填入 provider 名称、API Key、Base URL、默认模型
2. **角色路由**：为 6 个角色分配 provider 和模型（可选，默认使用 provider 的默认模型）

支持的 Provider（OpenAI SDK 兼容）：
- OpenAI（`https://api.openai.com/v1`）
- DeepSeek（`https://api.deepseek.com`）
- 其他兼容 OpenAI API 的服务

## 5. 安全注意事项

- API Key 存储在 Supabase 的 `provider_configs` 表中，受 RLS 保护，仅用户本人可访问
- 所有数据表均配置了 RLS 策略，用户只能访问自己的数据
- Supabase anon key 是公开的，安全性由 RLS 保证
- 建议在生产环境中启用 Supabase 的 SSL 强制连接
