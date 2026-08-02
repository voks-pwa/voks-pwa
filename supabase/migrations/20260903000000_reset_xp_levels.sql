-- Task 1a: Reset xp_levels to align with badge thresholds
-- Target: 0, 100, 500, 750, 1000, 4000, 10000, 25000, 50000

TRUNCATE TABLE public.xp_levels;

INSERT INTO public.xp_levels (level, xp_required, title)
VALUES
  (1, 0, 'Pendatang Baru'),
  (2, 100, 'Teman Voks'),
  (3, 500, 'Voks Aktif'),
  (4, 750, 'Penikmat Frekuensi'),
  (5, 1000, 'Voks Addict'),
  (6, 4000, 'Penguasa Gelombang'),
  (7, 10000, 'Voks Maniac'),
  (8, 25000, 'Voks Royalty'),
  (9, 50000, 'Voks Legend');
