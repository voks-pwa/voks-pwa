-- Add updated_at trigger to all tables that have the column.
-- Uses CREATE OR REPLACE FUNCTION so can be run multiple times safely.

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Apply trigger to each table that has an updated_at column.
-- Using DO block to dynamically apply only to tables with the column.
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT table_name
    FROM information_schema.columns
    WHERE table_catalog = current_database()
      AND table_schema = 'public'
      AND column_name = 'updated_at'
      AND table_name NOT LIKE '_prisma_migrations'
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%I_updated_at ON %I;', tbl, tbl
    );
    EXECUTE format(
      'CREATE TRIGGER trg_%I_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      tbl, tbl
    );
  END LOOP;
END;
$$;
