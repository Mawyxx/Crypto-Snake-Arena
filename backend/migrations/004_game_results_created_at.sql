-- Индекс для GetActivePlayersCount7d: WHERE created_at >= NOW() - INTERVAL '7 days'
CREATE INDEX IF NOT EXISTS idx_game_results_created_at ON game_results(created_at);
