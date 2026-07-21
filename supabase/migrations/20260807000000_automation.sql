-- Sprint D.1: Automation
--
-- Tables:
--   1. scheduled_jobs — event-driven background job scheduler (mission/campaign/sub expiry)
--   2. notification_queue — async notification dispatch queue with retry + dead-letter
-- RPCs:
--   create_scheduled_job, claim_due_jobs, mark_job_done, mark_job_failed,
--   enqueue_notification, claim_notification_batch, mark_notification_sent,
--   mark_notification_failed, requeue_dead_notifications

-- ============================================================
-- 1. scheduled_jobs
-- ============================================================
CREATE TABLE IF NOT EXISTS scheduled_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type TEXT NOT NULL
    CHECK (job_type IN ('MISSION_SCHEDULE', 'CAMPAIGN_SCHEDULE', 'SUBSCRIPTION_GRACE', 'SUBSCRIPTION_EXPIRY', 'BROADCAST_SEND', 'CUSTOM')),
  reference_id TEXT DEFAULT '',
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CLAIMED', 'DONE', 'FAILED')),
  run_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  claimed_at TIMESTAMPTZ,
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 3,
  last_error TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_sj_status_run ON scheduled_jobs(status, run_at);
CREATE INDEX IF NOT EXISTS idx_sj_type ON scheduled_jobs(job_type);

ALTER TABLE scheduled_jobs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sj service role all"
  ON scheduled_jobs FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 2. notification_queue
-- ============================================================
CREATE TABLE IF NOT EXISTS notification_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel TEXT NOT NULL DEFAULT 'IN_APP'
    CHECK (channel IN ('IN_APP', 'PUSH', 'EMAIL', 'BROADCAST')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_key TEXT DEFAULT '',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  image_url TEXT DEFAULT '',
  deep_link TEXT DEFAULT '',
  payload JSONB DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'PENDING'
    CHECK (status IN ('PENDING', 'CLAIMED', 'SENT', 'FAILED', 'DEAD')),
  attempts INT NOT NULL DEFAULT 0,
  max_attempts INT NOT NULL DEFAULT 5,
  next_retry_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_error TEXT DEFAULT '',
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_nq_status_retry ON notification_queue(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_nq_user ON notification_queue(user_id);

ALTER TABLE notification_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "nq service role all"
  ON notification_queue FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- 3. create_scheduled_job
-- ============================================================
CREATE OR REPLACE FUNCTION create_scheduled_job(
  p_job_type TEXT,
  p_run_at TIMESTAMPTZ,
  p_reference_id TEXT DEFAULT '',
  p_payload JSONB DEFAULT '{}',
  p_max_attempts INT DEFAULT 3
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO scheduled_jobs (job_type, run_at, reference_id, payload, max_attempts)
  VALUES (p_job_type, p_run_at, p_reference_id, p_payload, p_max_attempts)
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('success', true, 'job_id', v_id);
END;
$$;

-- ============================================================
-- 4. claim_due_jobs — worker picks up due PENDING jobs
-- ============================================================
CREATE OR REPLACE FUNCTION claim_due_jobs(p_limit INT DEFAULT 50)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_ids UUID[];
  v_id UUID;
BEGIN
  SELECT array_agg(id) INTO v_ids
  FROM (
    SELECT id FROM scheduled_jobs
    WHERE status = 'PENDING' AND run_at <= now()
    ORDER BY run_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  ) sub;

  IF v_ids IS NULL THEN
    RETURN jsonb_build_object('success', true, 'jobs', '[]'::JSONB);
  END IF;

  UPDATE scheduled_jobs
  SET status = 'CLAIMED', claimed_at = now(), attempts = attempts + 1, updated_at = now()
  WHERE id = ANY(v_ids);

  SELECT jsonb_agg(jsonb_build_object(
    'id', id, 'job_type', job_type, 'reference_id', reference_id,
    'payload', payload, 'attempts', attempts
  )) INTO v_ids FROM scheduled_jobs WHERE id = ANY(v_ids);

  RETURN jsonb_build_object('success', true, 'jobs', COALESCE(v_ids, '[]'::JSONB));
END;
$$;

-- ============================================================
-- 5. mark_job_done
-- ============================================================
CREATE OR REPLACE FUNCTION mark_job_done(p_job_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE scheduled_jobs
  SET status = 'DONE', updated_at = now()
  WHERE id = p_job_id;
  RETURN jsonb_build_object('success', true, 'job_id', p_job_id);
END;
$$;

-- ============================================================
-- 6. mark_job_failed — retry or dead-letter
-- ============================================================
CREATE OR REPLACE FUNCTION mark_job_failed(p_job_id UUID, p_error TEXT DEFAULT '')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts INT;
  v_max INT;
BEGIN
  SELECT attempts, max_attempts INTO v_attempts, v_max
  FROM scheduled_jobs WHERE id = p_job_id;

  IF v_attempts >= v_max THEN
    UPDATE scheduled_jobs
    SET status = 'FAILED', last_error = p_error, updated_at = now()
    WHERE id = p_job_id;
    RETURN jsonb_build_object('success', true, 'job_id', p_job_id, 'status', 'FAILED');
  END IF;

  UPDATE scheduled_jobs
  SET status = 'PENDING',
      run_at = now() + (power(2, v_attempts) || ' minutes')::INTERVAL,
      last_error = p_error,
      updated_at = now()
  WHERE id = p_job_id;

  RETURN jsonb_build_object('success', true, 'job_id', p_job_id, 'status', 'PENDING');
END;
$$;

-- ============================================================
-- 7. enqueue_notification
-- ============================================================
CREATE OR REPLACE FUNCTION enqueue_notification(
  p_channel TEXT,
  p_title TEXT,
  p_message TEXT,
  p_user_id UUID DEFAULT NULL,
  p_template_key TEXT DEFAULT '',
  p_image_url TEXT DEFAULT '',
  p_deep_link TEXT DEFAULT '',
  p_payload JSONB DEFAULT '{}'
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id UUID;
BEGIN
  INSERT INTO notification_queue (channel, user_id, template_key, title, message, image_url, deep_link, payload)
  VALUES (p_channel, p_user_id, p_template_key, p_title, p_message, p_image_url, p_deep_link, p_payload)
  RETURNING id INTO v_id;
  RETURN jsonb_build_object('success', true, 'queue_id', v_id);
END;
$$;

-- ============================================================
-- 8. claim_notification_batch — worker picks due PENDING items
-- ============================================================
CREATE OR REPLACE FUNCTION claim_notification_batch(p_limit INT DEFAULT 50)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_rows JSONB;
BEGIN
  UPDATE notification_queue
  SET status = 'CLAIMED', attempts = attempts + 1, updated_at = now()
  WHERE id IN (
    SELECT id FROM notification_queue
    WHERE status = 'PENDING' AND next_retry_at <= now()
    ORDER BY created_at ASC
    LIMIT p_limit
    FOR UPDATE SKIP LOCKED
  )
  RETURNING jsonb_build_object(
    'id', id, 'channel', channel, 'user_id', user_id, 'title', title,
    'message', message, 'image_url', image_url, 'deep_link', deep_link, 'payload', payload
  ) INTO v_rows;

  RETURN jsonb_build_object('success', true, 'items', COALESCE(v_rows, '[]'::JSONB));
END;
$$;

-- ============================================================
-- 9. mark_notification_sent
-- ============================================================
CREATE OR REPLACE FUNCTION mark_notification_sent(p_queue_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notification_queue
  SET status = 'SENT', sent_at = now(), updated_at = now()
  WHERE id = p_queue_id;
  RETURN jsonb_build_object('success', true, 'queue_id', p_queue_id);
END;
$$;

-- ============================================================
-- 10. mark_notification_failed — retry with backoff or dead-letter
-- ============================================================
CREATE OR REPLACE FUNCTION mark_notification_failed(p_queue_id UUID, p_error TEXT DEFAULT '')
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_attempts INT;
  v_max INT;
BEGIN
  SELECT attempts, max_attempts INTO v_attempts, v_max
  FROM notification_queue WHERE id = p_queue_id;

  IF v_attempts >= v_max THEN
    UPDATE notification_queue
    SET status = 'DEAD', last_error = p_error, updated_at = now()
    WHERE id = p_queue_id;
    RETURN jsonb_build_object('success', true, 'queue_id', p_queue_id, 'status', 'DEAD');
  END IF;

  UPDATE notification_queue
  SET status = 'PENDING',
      next_retry_at = now() + (power(2, v_attempts) || ' minutes')::INTERVAL,
      last_error = p_error,
      updated_at = now()
  WHERE id = p_queue_id;

  RETURN jsonb_build_object('success', true, 'queue_id', p_queue_id, 'status', 'PENDING');
END;
$$;

-- ============================================================
-- 11. requeue_dead_notifications — revive DEAD items (manual)
-- ============================================================
CREATE OR REPLACE FUNCTION requeue_dead_notifications()
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count INTEGER;
BEGIN
  UPDATE notification_queue
  SET status = 'PENDING', attempts = 0, next_retry_at = now(), last_error = ''
  WHERE status = 'DEAD';
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RETURN v_count;
END;
$$;
