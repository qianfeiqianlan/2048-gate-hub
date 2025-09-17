-- Add country column to score table
ALTER TABLE score ADD COLUMN country TEXT;

-- Create index for country column to improve query performance
CREATE INDEX IF NOT EXISTS idx_score_country ON score (country);