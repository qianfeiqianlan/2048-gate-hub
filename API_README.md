# Tinca Game API

基于 Hono 框架构建的游戏分数管理 API，从 NestJS 重构而来。

## 功能特性

- 用户登录/自动注册
- 分数上传（单个/批量）
- 用户分数查询
- 排行榜（前100名）
- JWT 认证
- 数据验证
- CORS 支持

## API 端点

### 用户相关

#### POST /user/login
用户登录或自动注册

**请求体：**
```json
{
  "username": "string",
  "password": "string"
}
```

**响应：**
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "userInfo": {
      "id": 1,
      "username": "testuser",
      "createdAt": 1703123456789,
      "updatedAt": 1703123456789
    },
    "token": "jwt_token_here"
  }
}
```

### 分数相关

#### GET /score
获取当前用户的所有分数（需要认证）

**请求头：**
```
Authorization: Bearer <jwt_token>
```

**响应：**
```json
{
  "success": true,
  "message": "获取用户分数成功",
  "data": {
    "userId": 1,
    "scores": [
      {
        "id": 1,
        "userId": 1,
        "gameId": "2048-classic",
        "score": 2048,
        "timestamp": 1703123456789,
        "date": "2023-12-21",
        "createdAt": 1703123456789,
        "updatedAt": 1703123456789
      }
    ]
  }
}
```

#### POST /score
上传单个分数（需要认证）

**请求头：**
```
Authorization: Bearer <jwt_token>
```

**请求体：**
```json
{
  "gameId": "2048-classic",
  "score": 2048,
  "timestamp": 1703123456789,
  "date": "2023-12-21"
}
```

#### POST /score/multiple
批量上传分数（需要认证）

**请求头：**
```
Authorization: Bearer <jwt_token>
```

**请求体：**
```json
{
  "scores": [
    {
      "gameId": "2048-classic",
      "score": 2048,
      "timestamp": 1703123456789,
      "date": "2023-12-21"
    },
    {
      "gameId": "tetris-classic",
      "score": 1500,
      "timestamp": 1703123456790,
      "date": "2023-12-21"
    }
  ]
}
```

#### GET /score/leaderboard
获取排行榜（公开接口，无需认证）

**响应：**
```json
{
  "success": true,
  "message": "获取排行榜成功",
  "data": {
    "topScores": [
      {
        "userId": 1,
        "username": "testuser",
        "highestScore": 2048,
        "gameId": "2048-classic",
        "timestamp": 1703123456789,
        "date": "2023-12-21",
        "createdAt": 1703123456789,
        "updatedAt": 1703123456789,
        "level": "Gold"
      }
    ]
  }
}
```

### 其他

#### GET /health
健康检查

**响应：**
```json
{
  "status": "ok",
  "timestamp": 1703123456789
}
```

## 等级系统

分数等级映射：
- 2300+ : Legend
- 2100+ : Master
- 1900+ : Grandmaster
- 1700+ : Diamond
- 1500+ : Platinum
- 1000+ : Gold
- 500+ : Silver
- 300+ : Bronze

## 环境变量

- `JWT_SECRET`: JWT 密钥（默认: "tinca-salt"）
- `SALT`: 密码加密盐值（默认: "tinca-salt"）

## 部署

1. 安装依赖：
```bash
yarn install
```

2. 构建项目：
```bash
yarn build
```

3. 部署到 Cloudflare Workers：
```bash
yarn deploy
```

## 数据库

使用 Cloudflare D1 数据库，包含以下表：

- `user`: 用户表
- `score`: 分数表

数据库迁移文件位于 `migrations-d1/` 目录。
