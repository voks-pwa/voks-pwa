# DEPLOY RULES

Before debugging frontend:

1. Verify Supabase CLI authentication.

supabase projects list

2. Verify linked project.

supabase status

3. Verify Edge Functions exist.

supabase functions list

4. Deploy missing functions.

supabase functions deploy

5. Invoke function manually.

supabase functions invoke <function-name>

6. Check Dashboard Logs.

Only after all backend verification passes may frontend debugging begin.