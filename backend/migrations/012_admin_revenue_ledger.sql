-- admin_revenue_ledger: детальный лог прибыли платформы для аудита и админки
CREATE TABLE IF NOT EXISTS admin_revenue_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id VARCHAR(64),
    player_id BIGINT,
    entry_fee DECIMAL(18,8) DEFAULT 0,
    platform_fee DECIMAL(18,8) NOT NULL,
    type VARCHAR(20) DEFAULT 'death',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_admin_ledger_created ON admin_revenue_ledger(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_ledger_type ON admin_revenue_ledger(type);
CREATE INDEX IF NOT EXISTS idx_admin_ledger_game ON admin_revenue_ledger(game_id);

-- VIEW для быстрого дашборда
CREATE OR REPLACE VIEW admin_dashboard_summary AS
SELECT
    COUNT(DISTINCT player_id) FILTER (WHERE player_id IS NOT NULL)::bigint as total_players_with_revenue,
    COUNT(DISTINCT game_id) FILTER (WHERE game_id IS NOT NULL)::bigint as total_games,
    COALESCE(SUM(platform_fee), 0)::decimal(18,8) as total_net_profit,
    COALESCE(AVG(platform_fee) FILTER (WHERE type = 'death'), 0)::decimal(18,8) as avg_profit_per_death
FROM admin_revenue_ledger;
