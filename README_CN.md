# 🎮 Tinca 游戏 API

基于 **Hono** 框架构建的现代化、无服务器游戏分数管理 API，部署在 **Cloudflare Workers** 上。从 NestJS 重构而来，充分利用边缘计算和全球分发的强大功能。

[English Documentation](./README.md) | [API 文档](./API_README.md)

## ✨ 功能特性

- 🔐 **JWT 认证** - 安全的用户认证，支持自动注册
- 📊 **分数管理** - 支持单个或批量分数上传，带有数据验证
- 🏆 **排行榜系统** - 实时全球排行榜，支持等级分类
- 🌍 **全球分发** - 由 Cloudflare 边缘网络提供支持
- 🚀 **无服务器架构** - 零配置部署和自动扩展
- 📱 **CORS 支持** - 支持 Web 和移动应用

## 🏗️ 架构设计

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   客户端应用     │───▶│  Cloudflare CDN  │───▶│  Cloudflare     │
│                 │    │   (全球边缘)      │    │   Workers       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Cloudflare D1  │
                                               │   (SQLite 数据库) │
                                               └─────────────────┘
```

### 核心组件

- **Hono 框架** - 专为边缘计算设计的超快速 Web 框架
- **Cloudflare Workers** - 边缘无服务器运行时
- **Cloudflare D1** - 分布式 SQLite 数据库
- **Cloudflare CDN** - 全球内容分发网络

## 🛠️ 技术栈

### 后端技术
- **[Hono](https://hono.dev/)** - 快速、轻量级 Web 框架
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - 无服务器计算平台
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - 分布式 SQL 数据库
- **[Zod](https://zod.dev/)** - TypeScript 优先的架构验证

### 安全与认证
- **JWT** - JSON Web Token 认证
- **MD5** - 带盐值的密码哈希
- **CORS** - 跨域资源共享

### 开发工具
- **TypeScript** - 类型安全的开发
- **Vite** - 快速构建工具和开发服务器
- **Wrangler** - Cloudflare 部署 CLI

## 🚀 快速开始

### 环境要求
- Node.js 18+ 
- Cloudflare 账户
- Wrangler CLI

### 安装步骤

```bash
# 克隆仓库
git clone https://github.com/yourusername/tinca-hono.git
cd tinca-hono

# 安装依赖
npm install

# 配置 Cloudflare D1 数据库
wrangler d1 create tinca

# 运行数据库迁移
wrangler d1 migrations apply tinca --local

# 生成 TypeScript 类型
npm run cf-typegen
```

### 开发环境

```bash
# 启动本地开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

### 部署

```bash
# 部署到 Cloudflare Workers
npm run deploy

# 应用数据库迁移到生产环境
wrangler d1 migrations apply tinca
```

## 📋 API 接口

| 方法 | 端点 | 描述 | 需要认证 |
|------|------|------|----------|
| `POST` | `/user/login` | 用户登录/自动注册 | ❌ |
| `GET` | `/score` | 获取用户分数 | ✅ |
| `POST` | `/score` | 上传单个分数 | ✅ |
| `POST` | `/score/multiple` | 批量上传分数 | ✅ |
| `GET` | `/score/leaderboard` | 获取全球排行榜 | ❌ |
| `GET` | `/health` | 健康检查 | ❌ |

## 🎯 业务逻辑

### 用户系统
- **自动注册**: 用户首次登录时自动注册
- **安全认证**: 带有可配置过期时间的 JWT 令牌
- **密码安全**: 使用 MD5 哈希和盐值保护密码

### 分数管理
- **单个和批量上传**: 支持单个和批量分数提交
- **重复防护**: 防止同一游戏/日期的重复分数条目
- **地理位置追踪**: 通过 Cloudflare 头部自动检测国家

### 排行榜系统
- **全球排名**: 所有游戏的前 100 名玩家
- **等级分类**: 8 级排名系统（青铜到传奇）
- **实时更新**: 即时排行榜更新

### 等级系统
| 分数范围 | 等级 | 徽章 |
|----------|------|------|
| 2300+ | 传奇 | 🏆 |
| 2100+ | 大师 | 🥇 |
| 1900+ | 宗师 | 🥈 |
| 1700+ | 钻石 | 💎 |
| 1500+ | 铂金 | 🔷 |
| 1000+ | 黄金 | 🥉 |
| 500+ | 白银 | ⚪ |
| 300+ | 青铜 | 🟤 |

## ⚙️ 配置

### 环境变量
```bash
JWT_SECRET=tinca-salt    # JWT 签名密钥
SALT=tinca-salt         # 密码哈希盐值
```

### Cloudflare 绑定
```typescript
interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  SALT?: string;
}
```

## 📊 数据库架构

### 用户表
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
```

### 分数表
```sql
CREATE TABLE score (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    gameId TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    date TEXT NOT NULL,
    country TEXT,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user (id)
);
```

## 🌟 Cloudflare 技术

本项目利用了多项 Cloudflare 技术：

- **Workers**: 边缘无服务器计算，实现超低延迟
- **D1**: 分布式 SQL 数据库，自动扩展
- **CDN**: 全球内容分发，实现全球性能
- **KV**（可选）: 键值存储，用于缓存
- **R2**（可选）: 对象存储，用于资产存储

## 📈 性能表现

- **冷启动**: < 1ms
- **全球延迟**: < 50ms 全球范围
- **自动扩展**: 自动处理流量峰值
- **零停机**: 滚动部署，零停机时间

## 🤝 贡献指南

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m '添加惊人功能'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🆘 支持

- 📖 [API 文档](./API_README.md)
- 🐛 [报告问题](https://github.com/qianfeiqianlan/2048-gate-hub/issues)
- 💬 [讨论](https://github.com/qianfeiqianlan/2048-gate-hub/discussions)

---

使用 [Hono](https://hono.dev/) 和 [Cloudflare Workers](https://workers.cloudflare.com/) 构建 ❤️
