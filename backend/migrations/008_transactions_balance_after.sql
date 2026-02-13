-- transactions: balance_after for audit
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS balance_after DECIMAL(18,8);
