-- 1. Create System Audit Logs Table
CREATE TABLE IF NOT EXISTS public.system_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 2. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_action ON public.system_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_system_audit_logs_user_id ON public.system_audit_logs(user_id, created_at DESC);

-- 3. RLS Policies
ALTER TABLE public.system_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only super_admin can read system audit logs
CREATE POLICY system_audit_logs_select
ON public.system_audit_logs
FOR SELECT
TO authenticated
USING (public.jwt_is_super_admin());

-- Insert: service role only (via backend admin client)
-- Postgres 'service_role' bypasses RLS by default if configured or we can allow authenticated but we don't insert from client anyway.
-- To be safe, we allow inserts from authenticated but our backend uses service_role.

-- Immutability: no updates or deletes ever
CREATE POLICY system_audit_logs_no_update ON public.system_audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY system_audit_logs_no_delete ON public.system_audit_logs FOR DELETE TO authenticated USING (false);
