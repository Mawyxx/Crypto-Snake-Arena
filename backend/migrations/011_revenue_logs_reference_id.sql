-- reference_id для идемпотентности death_rake
ALTER TABLE revenue_logs ADD COLUMN IF NOT EXISTS reference_id VARCHAR(128);
CREATE UNIQUE INDEX IF NOT EXISTS idx_revenue_logs_reference_id ON revenue_logs(reference_id) WHERE reference_id IS NOT NULL;
