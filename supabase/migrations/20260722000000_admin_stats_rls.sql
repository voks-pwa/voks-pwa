-- Campaign Admin Refactor: Admin RLS for stats tables
-- Admin users need SELECT access to ALL rows in stats tables to compute campaign analytics

CREATE POLICY "Admin can read all campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can read all mission progress"
  ON missions_progress FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can read all mission completions"
  ON mission_completions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can read all reward redemptions"
  ON reward_redemptions FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can read all campaign rewards"
  ON campaign_rewards FOR SELECT
  TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
