-- Sprint 8: Live Experience 2.0
-- Owncast = Video Only
-- All interaction → Supabase

-- 1. LIVE MESSAGES (replaces Owncast chat)
CREATE TABLE live_messages (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted BOOLEAN NOT NULL DEFAULT false,
  pinned BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE live_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live messages"
  ON live_messages FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert live messages"
  ON live_messages FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can delete own messages"
  ON live_messages FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Moderators can delete any message"
  ON live_messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Moderators can pin messages"
  ON live_messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_live_messages_created_at ON live_messages(created_at DESC);

-- Enable realtime for live_messages
ALTER PUBLICATION supabase_realtime ADD TABLE live_messages;


-- 2. LIVE PRESENCE
CREATE TABLE live_presence (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen TIMESTAMPTZ NOT NULL DEFAULT now(),
  duration INT NOT NULL DEFAULT 0
);

ALTER TABLE live_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live presence"
  ON live_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can upsert own presence"
  ON live_presence FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can update own presence"
  ON live_presence FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE live_presence;


-- 3. LIVE REACTIONS
CREATE TABLE live_reactions (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reaction TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE live_reactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live reactions"
  ON live_reactions FOR SELECT
  USING (true);

CREATE POLICY "Auth users can insert own reactions"
  ON live_reactions FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

CREATE POLICY "Users can delete own reactions"
  ON live_reactions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Moderators can delete any reaction"
  ON live_reactions FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE INDEX idx_live_reactions_created_at ON live_reactions(created_at DESC);

ALTER PUBLICATION supabase_realtime ADD TABLE live_reactions;


-- 4. LIVE POLLS
CREATE TABLE live_polls (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  question TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE live_polls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live polls"
  ON live_polls FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage live polls"
  ON live_polls FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE live_polls;


-- 5. LIVE POLL OPTIONS
CREATE TABLE live_poll_options (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  poll_id BIGINT NOT NULL REFERENCES live_polls(id) ON DELETE CASCADE,
  title TEXT NOT NULL
);

ALTER TABLE live_poll_options ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read poll options"
  ON live_poll_options FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage poll options"
  ON live_poll_options FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE live_poll_options;


-- 6. LIVE POLL VOTES
CREATE TABLE live_poll_votes (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  poll_id BIGINT NOT NULL REFERENCES live_polls(id) ON DELETE CASCADE,
  option_id BIGINT NOT NULL REFERENCES live_poll_options(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  UNIQUE(poll_id, user_id)
);

ALTER TABLE live_poll_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read poll votes"
  ON live_poll_votes FOR SELECT
  USING (true);

CREATE POLICY "Auth users can vote once per poll"
  ON live_poll_votes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE live_poll_votes;


-- 7. LIVE GIVEAWAYS
CREATE TABLE live_giveaways (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  title TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  winner UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE live_giveaways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read live giveaways"
  ON live_giveaways FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage giveaways"
  ON live_giveaways FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

ALTER PUBLICATION supabase_realtime ADD TABLE live_giveaways;


-- 8. LIVE GIVEAWAY ENTRIES
CREATE TABLE live_giveaway_entries (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  giveaway_id BIGINT NOT NULL REFERENCES live_giveaways(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(giveaway_id, user_id)
);

ALTER TABLE live_giveaway_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read giveaway entries"
  ON live_giveaway_entries FOR SELECT
  USING (true);

CREATE POLICY "Auth users can join once per giveaway"
  ON live_giveaway_entries FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' AND user_id = auth.uid());

ALTER PUBLICATION supabase_realtime ADD TABLE live_giveaway_entries;


-- 9. LIVE MODERATION LOGS
CREATE TABLE live_moderation_logs (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  action TEXT NOT NULL,
  admin_id UUID NOT NULL REFERENCES profiles(id),
  target_user TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE live_moderation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage moderation logs"
  ON live_moderation_logs FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
