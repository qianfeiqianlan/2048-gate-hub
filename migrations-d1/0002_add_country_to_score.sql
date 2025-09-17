-- 为 score 表添加 country 字段
ALTER TABLE score ADD COLUMN country TEXT;

-- 为 country 字段创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_score_country ON score (country);