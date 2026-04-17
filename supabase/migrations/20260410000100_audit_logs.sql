CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES institutions(id),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  resource_type TEXT NOT NULL,
  resource_id UUID,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_institution_created ON audit_logs(institution_id, created_at DESC);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Read: only users with audit.read permission
CREATE POLICY audit_logs_select ON audit_logs
  FOR SELECT TO authenticated
  USING (
    public.jwt_is_super_admin()
    OR public.current_user_has_permission(institution_id, 'audit.read')
  );

-- Insert: service role only (via backend admin client)
CREATE POLICY audit_logs_insert ON audit_logs
  FOR INSERT TO authenticated
  WITH CHECK (institution_id IS NOT NULL);

-- Immutability: no updates or deletes ever
CREATE POLICY audit_logs_no_update ON audit_logs FOR UPDATE TO authenticated USING (false);
CREATE POLICY audit_logs_no_delete ON audit_logs FOR DELETE TO authenticated USING (false);
