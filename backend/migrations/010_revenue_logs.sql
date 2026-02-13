-- revenue_logs: каждый цент комиссии платформы для аналитики
CREATE TABLE IF NOT EXISTS revenue_logs (
    id BIGSERIAL PRIMARY KEY,
    room_id VARCHAR(64) NOT NULL,
    transaction_type VARCHAR(32) NOT NULL, -- death_rake, withdraw_fee, etc.
    amount DECIMAL(18,8) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_revenue_logs_room_id ON revenue_logs(room_id);
CREATE INDEX idx_revenue_logs_created_at ON revenue_logs(created_at);
