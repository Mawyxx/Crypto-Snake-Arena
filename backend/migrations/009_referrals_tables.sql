-- Таблицы реферальной системы (если не созданы через GORM AutoMigrate)

CREATE TABLE IF NOT EXISTS referrals (
    id SERIAL PRIMARY KEY,
    referrer_id INT NOT NULL REFERENCES users(id),
    referred_id INT NOT NULL UNIQUE REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

CREATE TABLE IF NOT EXISTS referral_earnings (
    id SERIAL PRIMARY KEY,
    referrer_id INT NOT NULL REFERENCES users(id),
    referred_id INT REFERENCES users(id),
    amount DECIMAL(18,8) NOT NULL,
    source_tx_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_referral_earnings_referrer ON referral_earnings(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_referred ON referral_earnings(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_earnings_source ON referral_earnings(source_tx_id);
