CREATE TABLE IF NOT EXISTS game_results (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES users(id),
    stake DECIMAL(18,8) NOT NULL,
    loot DECIMAL(18,8) NOT NULL,
    profit DECIMAL(18,8) NOT NULL,
    room_id VARCHAR(64),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_game_results_user_profit ON game_results(user_id, profit);
