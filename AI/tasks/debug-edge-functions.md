# TASK

Debug all failing Admin Edge Functions.

Current errors

- Failed to load analytics
- Failed to load broadcasts
- Failed to load settings

Workflow

1. Find every supabase.functions.invoke() call.

2. List which Edge Function each page uses.

3. Test every Edge Function individually.

4. Record:

- HTTP Status
- Response Body
- Missing Secrets
- Database Errors
- WordPress Errors

5. Fix backend first.

6. Do NOT modify frontend until backend returns success.

7. Update:

AI/SESSION_MEMORY.md

AI/CHANGELOG.md

AI/TASK_BOARD.md