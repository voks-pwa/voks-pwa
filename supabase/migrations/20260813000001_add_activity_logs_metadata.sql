-- Add metadata column to activity_logs for Action Engine payloads
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Refresh schema cache so Supabase client picks up the new column
NOTIFY pgrst, 'reload schema';
