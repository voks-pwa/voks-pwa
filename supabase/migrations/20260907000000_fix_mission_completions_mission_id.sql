-- Fix root cause: prod `mission_completions.mission_id` is UUID (schema drift),
-- but the claim RPC passes the WP post id (bigint). INSERT fails -> whole claim
-- transaction rolls back -> NO VXP ever credited for mission claims.
-- Fix: convert the column to BIGINT (matching repo migration 20260715000001).
-- Guard: abort if rows exist (need manual mapping).

DO $$
DECLARE
  v_count BIGINT;
  v_type TEXT;
BEGIN
  SELECT COUNT(*) INTO v_count FROM public.mission_completions;

  SELECT data_type INTO v_type
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'mission_completions'
    AND column_name = 'mission_id';

  IF v_type = 'bigint' THEN
    RAISE NOTICE 'mission_completions.mission_id already bigint; skip';
    RETURN;
  END IF;

  IF v_count > 0 THEN
    RAISE EXCEPTION 'mission_completions has % rows; manual mapping required before type change', v_count;
  END IF;

  ALTER TABLE public.mission_completions
    ALTER COLUMN mission_id TYPE BIGINT USING mission_id::text::bigint;

  RAISE NOTICE 'mission_completions.mission_id converted to bigint';
END;
$$;
