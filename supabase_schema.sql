-- =========================================================
-- TrackU Supabase PostgreSQL Database Schema
-- Run this script inside your Supabase SQL Editor to create tables.
-- =========================================================

-- 1. Create Tracked Items Table
CREATE TABLE IF NOT EXISTS tracked_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  sector TEXT NOT NULL,
  type TEXT NOT NULL,
  period TEXT NOT NULL,
  input_type TEXT NOT NULL,
  unit TEXT,
  target_value NUMERIC,
  add_remark BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Log Entries Table
CREATE TABLE IF NOT EXISTS log_entries (
  id TEXT PRIMARY KEY,
  item_id TEXT REFERENCES tracked_items(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  value JSONB NOT NULL,
  percentage_value NUMERIC,
  remark TEXT,
  timestamp BIGINT NOT NULL
);

-- 3. Enable Row Level Security (RLS) & Allow Anonymous Read/Write Access
ALTER TABLE tracked_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE log_entries ENABLE ROW LEVEL SECURITY;

-- Public RLS Policies
DROP POLICY IF EXISTS "Allow public access for tracked_items" ON tracked_items;
CREATE POLICY "Allow public access for tracked_items" ON tracked_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public access for log_entries" ON log_entries;
CREATE POLICY "Allow public access for log_entries" ON log_entries FOR ALL USING (true) WITH CHECK (true);

-- 4. Enable Realtime Publications
ALTER PUBLICATION supabase_realtime ADD TABLE tracked_items;
ALTER PUBLICATION supabase_realtime ADD TABLE log_entries;
