-- 创建用户表
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- 创建分数表
CREATE TABLE IF NOT EXISTS score (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    gameId TEXT NOT NULL,
    score INTEGER NOT NULL,
    timestamp INTEGER NOT NULL,
    date TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL,
    FOREIGN KEY (userId) REFERENCES user (id)
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_username ON user (username);

CREATE INDEX IF NOT EXISTS idx_score_userId ON score (userId);

CREATE INDEX IF NOT EXISTS idx_score_gameId ON score (gameId);

CREATE INDEX IF NOT EXISTS idx_score_score ON score (score DESC);