-- pending_rewards: неудачные начисления для повторной обработки
CREATE TABLE IF NOT EXISTS pending_rewards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INT NOT NULL REFERENCES users(id),
    amount DECIMAL(18,8) NOT NULL,
    reference_id VARCHAR(255) NOT NULL,
    room_id VARCHAR(64),
    source VARCHAR(32) NOT NULL,
    retry_count INT DEFAULT 0,
    last_error TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_pending_rewards_ref ON pending_rewards(reference_id) WHERE status IN ('pending', 'processing');
CREATE INDEX IF NOT EXISTS idx_pending_rewards_status ON pending_rewards(status);
CREATE INDEX IF NOT EXISTS idx_pending_rewards_created ON pending_rewards(created_at);
