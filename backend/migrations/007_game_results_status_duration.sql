-- game_results: status (win/loss/draw), duration (seconds)
ALTER TABLE game_results ADD COLUMN IF NOT EXISTS status VARCHAR(10) DEFAULT 'loss';
ALTER TABLE game_results ADD COLUMN IF NOT EXISTS duration INT DEFAULT 0;
UPDATE game_results SET status = CASE WHEN profit > 0 THEN 'win' ELSE 'loss' END WHERE status IS NULL OR status = '';
