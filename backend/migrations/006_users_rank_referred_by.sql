-- users: rank (cached Global Rank), referred_by (FK to users)
ALTER TABLE users ADD COLUMN IF NOT EXISTS rank INT DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS referred_by INT REFERENCES users(id);
CREATE INDEX IF NOT EXISTS idx_users_referred_by ON users(referred_by);
CREATE INDEX IF NOT EXISTS idx_users_rank ON users(rank);
