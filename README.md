# 🎮 Tinca Game API

A modern, serverless game score management API built with **Hono** and deployed on **Cloudflare Workers**. Migrated from NestJS to leverage the power of edge computing and global distribution.

[中文文档](./README_CN.md) | [API Documentation](./API_README.md)

## ✨ Features

- 🔐 **JWT Authentication** - Secure user authentication with automatic registration
- 📊 **Score Management** - Upload single or batch scores with validation
- 🏆 **Leaderboard System** - Real-time global rankings with tier classification
- 🌍 **Global Distribution** - Powered by Cloudflare's edge network
- 🚀 **Serverless Architecture** - Zero-config deployment and auto-scaling
- 📱 **CORS Enabled** - Ready for web and mobile applications

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Client Apps   │───▶│  Cloudflare CDN  │───▶│  Cloudflare     │
│                 │    │   (Global Edge)  │    │   Workers       │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
                                               ┌─────────────────┐
                                               │  Cloudflare D1  │
                                               │   (SQLite DB)   │
                                               └─────────────────┘
```

### Core Components

- **Hono Framework** - Ultra-fast web framework for edge computing
- **Cloudflare Workers** - Serverless runtime at the edge
- **Cloudflare D1** - Distributed SQLite database
- **Cloudflare CDN** - Global content delivery network

## 🛠️ Tech Stack

### Backend
- **[Hono](https://hono.dev/)** - Fast, lightweight web framework
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Serverless compute platform
- **[Cloudflare D1](https://developers.cloudflare.com/d1/)** - Distributed SQL database
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation

### Security & Auth
- **JWT** - JSON Web Token authentication
- **MD5** - Password hashing with salt
- **CORS** - Cross-origin resource sharing

### Development
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Wrangler** - Cloudflare CLI for deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Cloudflare account
- Wrangler CLI

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/tinca-hono.git
cd tinca-hono

# Install dependencies
npm install

# Configure Cloudflare D1 database
wrangler d1 create tinca

# Run database migrations
wrangler d1 migrations apply tinca --local

# Generate TypeScript types
npm run cf-typegen
```

### Development

```bash
# Start local development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment

```bash
# Deploy to Cloudflare Workers
npm run deploy

# Apply database migrations to production
wrangler d1 migrations apply tinca
```

## 📋 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/user/login` | User login/auto registration | ❌ |
| `GET` | `/score` | Get user scores | ✅ |
| `POST` | `/score` | Upload single score | ✅ |
| `POST` | `/score/multiple` | Upload batch scores | ✅ |
| `GET` | `/score/leaderboard` | Get global leaderboard | ❌ |
| `GET` | `/health` | Health check | ❌ |

## 🎯 Business Logic

### User System
- **Auto Registration**: Users are automatically registered on first login
- **Secure Authentication**: JWT tokens with configurable expiration
- **Password Security**: MD5 hashing with salt for password protection

### Score Management
- **Single & Batch Upload**: Support for individual and bulk score submissions
- **Duplicate Prevention**: Prevents duplicate score entries for same game/date
- **Geographic Tracking**: Automatic country detection via Cloudflare headers

### Leaderboard System
- **Global Rankings**: Top 100 players across all games
- **Tier Classification**: 8-tier ranking system (Bronze to Legend)
- **Real-time Updates**: Instant leaderboard updates

### Tier System
| Score Range | Tier | Badge |
|-------------|------|-------|
| 2300+ | Legend | 🏆 |
| 2100+ | Master | 🥇 |
| 1900+ | Grandmaster | 🥈 |
| 1700+ | Diamond | 💎 |
| 1500+ | Platinum | 🔷 |
| 1000+ | Gold | 🥉 |
| 500+ | Silver | ⚪ |
| 300+ | Bronze | 🟤 |

## ⚙️ Configuration

### Environment Variables
```bash
JWT_SECRET=tinca-salt    # JWT signing secret
SALT=tinca-salt         # Password hashing salt
```

### Cloudflare Bindings
```typescript
interface Env {
  DB: D1Database;
  JWT_SECRET?: string;
  SALT?: string;
}
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);
```

### Scores Table
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

## 🌟 Cloudflare Technologies

This project leverages several Cloudflare technologies:

- **Workers**: Serverless compute at the edge for ultra-low latency
- **D1**: Distributed SQL database with automatic scaling
- **CDN**: Global content delivery for worldwide performance
- **KV** (Optional): Key-value storage for caching
- **R2** (Optional): Object storage for assets

## 📈 Performance

- **Cold Start**: < 1ms
- **Global Latency**: < 50ms worldwide
- **Auto Scaling**: Handles traffic spikes automatically
- **Zero Downtime**: Rolling deployments with zero downtime

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- 📖 [API Documentation](./API_README.md)
- 🐛 [Report Issues](https://github.com/qianfeiqianlan/2048-gate-hub/issues)
- 💬 [Discussions](https://github.com/qianfeiqianlan/2048-gate-hub/discussions)


---

Built with ❤️ using [Hono](https://hono.dev/) and [Cloudflare Workers](https://workers.cloudflare.com/)