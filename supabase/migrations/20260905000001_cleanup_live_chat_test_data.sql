-- Cleanup test/seed data in live chat (TEMUAN QA)
-- Verified rows: message 'test'/'Test'/'sdasda' from Admin Voks + dmj.rajandreas
-- Idempotent: second run deletes 0 rows.

DELETE FROM public.live_messages
WHERE message IN ('test', 'Test', 'sdasda')
   OR id IN (3, 4, 5, 6);
