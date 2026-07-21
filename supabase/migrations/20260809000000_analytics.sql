-- Sprint D.3: Analytics
--
-- RPCs for commerce-domain analytics:
--   get_wallet_analytics  — VXP minted / spent / net from wallet_ledger
--   get_campaign_analytics — campaign participation from campaigns + campaign_rewards
--   get_commerce_kpis — unified KPI rollup (commerce + subscription + wallet + campaign)

-- ============================================================
-- 1. get_wallet_analytics
-- ============================================================
CREATE OR REPLACE FUNCTION get_wallet_analytics(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_minted INT;
  v_spent INT;
  v_txn_count INT;
  v_active_wallets INT;
BEGIN
  SELECT
    COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0),
    COUNT(*),
    COUNT(DISTINCT user_id)
  INTO v_minted, v_spent, v_txn_count, v_active_wallets
  FROM wallet_ledger
  WHERE created_at >= now() - (p_days || ' days')::INTERVAL;

  RETURN jsonb_build_object(
    'success', true,
    'minted', v_minted,
    'spent', v_spent,
    'net', v_minted - v_spent,
    'transactions', v_txn_count,
    'active_wallets', v_active_wallets
  );
END;
$$;

-- ============================================================
-- 2. get_campaign_analytics
-- ============================================================
CREATE OR REPLACE FUNCTION get_campaign_analytics(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_total_campaigns INT;
  v_active_campaigns INT;
  v_rewards_granted INT;
  v_participants INT;
  v_vxp_distributed INT;
  v_recent_rewards INT;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(CASE WHEN active THEN 1 ELSE 0 END), 0)
  INTO v_total_campaigns, v_active_campaigns
  FROM campaigns;

  SELECT COUNT(*), COUNT(DISTINCT user_id), COALESCE(SUM(reward_vxp), 0)
  INTO v_rewards_granted, v_participants, v_vxp_distributed
  FROM campaign_rewards;

  SELECT COUNT(*) INTO v_recent_rewards
  FROM campaign_rewards
  WHERE granted_at >= now() - (p_days || ' days')::INTERVAL;

  RETURN jsonb_build_object(
    'success', true,
    'total_campaigns', v_total_campaigns,
    'active_campaigns', v_active_campaigns,
    'rewards_granted', v_rewards_granted,
    'participants', v_participants,
    'vxp_distributed', v_vxp_distributed,
    'recent_rewards', v_recent_rewards
  );
END;
$$;

-- ============================================================
-- 3. get_commerce_kpis — unified rollup
-- ============================================================
CREATE OR REPLACE FUNCTION get_commerce_kpis(p_days INT DEFAULT 30)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_revenue INT;
  v_orders INT;
  v_fulfillments INT;
  v_refunds INT;
  v_active_subs INT;
  v_minted INT;
  v_spent INT;
  v_campaign_participants INT;
BEGIN
  SELECT COALESCE(SUM(total_amount), 0), COUNT(*)
  INTO v_revenue, v_orders
  FROM marketplace_orders
  WHERE order_status NOT IN ('DRAFT')
    AND created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_fulfillments
  FROM marketplace_fulfillment
  WHERE created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_refunds
  FROM refund_records
  WHERE created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_active_subs
  FROM user_subscriptions
  WHERE status = 'ACTIVE';

  SELECT COALESCE(SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END), 0),
         COALESCE(SUM(CASE WHEN amount < 0 THEN -amount ELSE 0 END), 0)
  INTO v_minted, v_spent
  FROM wallet_ledger
  WHERE created_at >= now() - (p_days || ' days')::INTERVAL;

  SELECT COUNT(DISTINCT user_id) INTO v_campaign_participants
  FROM campaign_rewards;

  RETURN jsonb_build_object(
    'success', true,
    'revenue', v_revenue,
    'orders', v_orders,
    'fulfillments', v_fulfillments,
    'refunds', v_refunds,
    'active_subscriptions', v_active_subs,
    'wallet_minted', v_minted,
    'wallet_spent', v_spent,
    'campaign_participants', v_campaign_participants
  );
END;
$$;
