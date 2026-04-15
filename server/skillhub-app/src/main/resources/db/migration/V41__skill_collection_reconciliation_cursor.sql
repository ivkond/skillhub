ALTER TABLE skill_collection
    ADD COLUMN IF NOT EXISTS last_reconciled_at TIMESTAMPTZ;

UPDATE skill_collection
SET last_reconciled_at = COALESCE(last_reconciled_at, '1970-01-01 00:00:00+00'::timestamptz);

ALTER TABLE skill_collection
    ALTER COLUMN last_reconciled_at SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_skill_collection_reconcile_cursor
    ON skill_collection (last_reconciled_at, id);
