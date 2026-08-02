-- Update to match BADGE_LEVEL_USER.md badge thresholds:
-- 0: Pendatang Baru (0 XP)
-- 100: Teman Voks (100 XP)
-- 250: Voks Aktif (250 XP)
-- 500: Penikmat Frekuensi (500 XP)
-- 1000: Voks Addict (1000 XP)
-- 4000: Penguasa Gelombang (4000 XP)
-- 10000: Voks Maniac (10000 XP)
-- 25000: Voks Royalty (25000 XP)
-- 50000: Voks Legend (50000 XP)

CREATE OR REPLACE FUNCTION update_xp_levels_and_xp_badges()
RETURNS VOID AS $$
BEGIN
  -- Update xp_levels to match badge thresholds
  TRUNCATE TABLE xp_levels;
  
  INSERT INTO xp_levels (level, xp_required, title)
  VALUES
    (1, 0, 'Pendatang Baru'),
    (2, 100, 'Teman Voks'),
    (3, 250, 'Voks Aktif'),
    (4, 500, 'Penikmat Frekuensi'),
    (5, 1000, 'Voks Addict'),
    (6, 4000, 'Penguasa Gelombang'),
    (7, 10000, 'Voks Maniac'),
    (8, 25000, 'Voks Royalty'),
    (9, 50000, 'Voks Legend');
  
  -- Update xp_badges to match badge thresholds exactly
  TRUNCATE TABLE xp_badges;
  
  INSERT INTO xp_badges (slug, title, description, min_lifetime_vxp, sort_order)
  VALUES
    ('pendatang-baru', 'Pendatang Baru', 'Memulai perjalanan di Voks', 0, 1),
    ('teman-voks', 'Teman Voks', 'Telah mengumpulkan 100 VXP', 100, 2),
    ('voks-aktif', 'Voks Aktif', 'Telah mengumpulkan 500 VXP', 500, 3),
    ('penikmat-frekuensi', 'Penikmat Frekuensi', 'Telah mengumpulkan 750 VXP', 750, 4),
    ('voks-addict', 'Voks Addict', 'Telah mengumpulkan 1000 VXP', 1000, 5),
    ('penguasa-gelombang', 'Penguasa Gelombang', 'Telah mengumpulkan 4000 VXP', 4000, 6),
    ('voks-maniac', 'Voks Maniac', 'Telah mengumpulkan 10000 VXP', 10000, 7),
    ('voks-vip', 'Voks VIP', 'Telah mengumpulkan 25000 VXP', 25000, 8),
    ('voks-legend', 'Voks Legend', 'Telah mengumpulkan 50000 VXP', 50000, 9);
  
  -- Add role-based badges
  INSERT INTO xp_badges (slug, title, description, min_role, sort_order)
  VALUES
    ('admin', 'Admin', 'Admin Voks', 'admin', 10),
    ('superadmin', 'Super Admin', 'Super Admin Voks', 'superadmin', 11),
    ('announcer', 'Penyiar', 'Penyiar Voks', 'announcer', 12)
  ON CONFLICT (slug) DO NOTHING;
END;
$$ LANGUAGE plpgsql;
