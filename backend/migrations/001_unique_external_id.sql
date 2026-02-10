-- Idempotency: UNIQUE индекс на external_id для ProcessDeposit
-- Partial index: только для deposit (external_id не пустой). game_entry не имеет external_id.
CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_id_unique
ON transactions(external_id) WHERE external_id != '' AND external_id IS NOT NULL;
