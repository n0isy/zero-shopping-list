-- Shopping List schema for Zero sync
CREATE TABLE IF NOT EXISTS "list" (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT 'Shopping List',
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE TABLE IF NOT EXISTS "item" (
  id TEXT PRIMARY KEY,
  list_id TEXT NOT NULL REFERENCES "list"(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  checked BOOLEAN NOT NULL DEFAULT FALSE,
  sort_order DOUBLE PRECISION NOT NULL DEFAULT 0,
  created_at BIGINT NOT NULL DEFAULT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT
);

CREATE INDEX idx_item_list_id ON "item"(list_id);
CREATE INDEX idx_item_sort_order ON "item"(sort_order);

-- Enable logical replication for Zero
ALTER SYSTEM SET wal_level = 'logical';
