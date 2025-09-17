-- Create user table
CREATE TABLE IF NOT EXISTS user (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    updatedAt INTEGER NOT NULL
);

-- Create score table
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

-- Create indexes to improve query performance
CREATE INDEX IF NOT EXISTS idx_user_username ON user (username);

CREATE INDEX IF NOT EXISTS idx_score_userId ON score (userId);

CREATE INDEX IF NOT EXISTS idx_score_gameId ON score (gameId);

CREATE INDEX IF NOT EXISTS idx_score_score ON score (score DESC);