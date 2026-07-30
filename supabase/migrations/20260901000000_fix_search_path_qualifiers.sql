-- Fix: qualify all table references when search_path = '' (security definer pattern)
-- 4 fungsi di 20260822000003_data_integrity.sql lupa pake public. prefix

CREATE OR REPLACE FUNCTION expire_stale_pending()
RETURNS TABLE(expired_count BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_count BIGINT;
BEGIN
  UPDATE public.wallet_ledger
  SET status = 'EXPIRED',
      updated_at = now(),
      metadata = COALESCE(metadata, '{}'::jsonb) || '{"expired_by": "stale_recovery", "expired_at": "' || now()::text || '"}'::jsonb
  WHERE status = 'PENDING'
    AND created_at < now() - interval '5 minutes'
    AND transaction_key IS NOT NULL;

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN QUERY SELECT v_count;
END;
$$;

CREATE OR REPLACE FUNCTION get_user_analytics(p_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_transactions', (SELECT COUNT(*) FROM public.wallet_ledger WHERE user_id = p_user_id),
    'total_xp_earned', (SELECT COALESCE(SUM(amount), 0) FROM public.wallet_ledger WHERE user_id = p_user_id AND amount > 0 AND status = 'SUCCESS'),
    'total_xp_spent', (SELECT COALESCE(SUM(ABS(amount)), 0) FROM public.wallet_ledger WHERE user_id = p_user_id AND amount < 0 AND status = 'SUCCESS'),
    'missions_completed', (SELECT COUNT(*) FROM public.missions_progress WHERE user_id = p_user_id AND completed = true),
    'rewards_redeemed', (SELECT COUNT(*) FROM public.reward_redeems WHERE user_id = p_user_id AND status = 'APPROVED'),
    'current_streak', (SELECT COALESCE(current_streak, 0) FROM public.user_streaks WHERE user_id = p_user_id),
    'badges_earned', (SELECT COUNT(*) FROM public.user_badges WHERE user_id = p_user_id)
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_mission_analytics(p_mission_id INTEGER)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'total_attempts', (SELECT COUNT(*) FROM public.missions_progress WHERE mission_id = p_mission_id),
    'total_completions', (SELECT COUNT(*) FROM public.missions_progress WHERE mission_id = p_mission_id AND completed = true),
    'unique_users', (SELECT COUNT(DISTINCT user_id) FROM public.missions_progress WHERE mission_id = p_mission_id),
    'last_completion', (SELECT MAX(updated_at) FROM public.missions_progress WHERE mission_id = p_mission_id AND completed = true)
  ) INTO result;

  RETURN result;
END;
$$;

CREATE OR REPLACE FUNCTION get_daily_earnings(p_user_id UUID, p_date TEXT)
RETURNS TABLE(total BIGINT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT COALESCE(SUM(amount), 0)::BIGINT
  FROM public.wallet_ledger
  WHERE user_id = p_user_id
    AND amount > 0
    AND status = 'SUCCESS'
    AND created_at::DATE = p_date::DATE;
END;
$$;
