-- 1. SUPABASE AUTH — app_metadata SYNC TRIGGER
-- This ensures that roles stored in the public schema are automatically synced to auth.users.app_metadata
-- for fast access in the frontend role guard and backend JWT guards.

CREATE OR REPLACE FUNCTION public.sync_user_roles_to_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_role_codes text[];
BEGIN
  -- Get the user_id from institution_users matching the record
  IF TG_OP = 'DELETE' THEN
    SELECT user_id INTO v_user_id FROM public.institution_users WHERE id = OLD.institution_user_id;
  ELSE
    SELECT user_id INTO v_user_id FROM public.institution_users WHERE id = NEW.institution_user_id;
  END IF;

  IF v_user_id IS NOT NULL THEN
    -- Get all role codes for this user across all institutions
    SELECT array_agg(DISTINCT r.code) INTO v_role_codes
    FROM public.institution_user_roles iur
    JOIN public.roles r ON r.id = iur.role_id
    JOIN public.institution_users iu ON iu.id = iur.institution_user_id
    WHERE iu.user_id = v_user_id AND iu.status = 'active';

    -- Update auth.users raw_app_meta_data
    -- We preserve existing metadata but update the 'roles' key
    UPDATE auth.users
    SET raw_app_meta_data = 
      COALESCE(raw_app_meta_data, '{}'::jsonb) || 
      jsonb_build_object('roles', COALESCE(v_role_codes, ARRAY[]::text[]))
    WHERE id = v_user_id;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_user_roles_metadata ON public.institution_user_roles;
CREATE TRIGGER trg_sync_user_roles_metadata
AFTER INSERT OR UPDATE OR DELETE ON public.institution_user_roles
FOR EACH ROW EXECUTE FUNCTION public.sync_user_roles_to_metadata();

-- 2. RLS POLICY AUDIT & FIXES
-- Flagged: Using (true) on sensitive tables, missing policies, user_metadata usage.

-- A. Audit Logs RLS
ALTER TABLE public.institution_audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS audit_logs_select_by_permission ON public.institution_audit_logs;
CREATE POLICY audit_logs_select_by_permission
ON public.institution_audit_logs
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'audit.read')
);

-- B. Institutions
DROP POLICY IF EXISTS institutions_select_by_membership ON public.institutions;
CREATE POLICY institutions_select_by_membership
ON public.institutions
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR id IN (
    SELECT iu.institution_id 
    FROM public.institution_users iu 
    WHERE iu.user_id = auth.uid() 
      AND iu.status = 'active'
  )
);

-- C. Institution Users (Avoid recursion by using auth.uid() directly)
DROP POLICY IF EXISTS institution_users_select_by_membership ON public.institution_users;
CREATE POLICY institution_users_select_by_membership
ON public.institution_users
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR institution_id IN (
    SELECT iu.institution_id 
    FROM public.institution_users iu 
    WHERE iu.user_id = auth.uid() 
      AND iu.status = 'active'
  )
);

-- D. Standardize all policies to use app_metadata via jwt_is_super_admin()
-- Checked: jwt_is_super_admin() ALREADY uses app_metadata. This is correct.

-- E. Fix roles/permissions "USING (true)"
-- These are platform-wide read-only tables. Restricting to authenticated is enough,
-- but they should not be writable by anyone but super admins.
DROP POLICY IF EXISTS roles_select_all ON public.roles;
CREATE POLICY roles_select_all ON public.roles FOR SELECT TO authenticated USING (true);
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS permissions_select_all ON public.permissions;
CREATE POLICY permissions_select_all ON public.permissions FOR SELECT TO authenticated USING (true);
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS role_permissions_select_all ON public.role_permissions;
CREATE POLICY role_permissions_select_all ON public.role_permissions FOR SELECT TO authenticated USING (true);
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- F. Questions Update/Delete (Owner or Admin)
DROP POLICY IF EXISTS questions_mutate_by_owner_or_admin ON public.institution_questions;
CREATE POLICY questions_mutate_by_owner_or_admin
ON public.institution_questions
FOR ALL -- Covers UPDATE, DELETE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR (
    created_by_user_id = auth.uid() 
    AND institution_id IN (SELECT public.current_user_institution_ids())
  )
  OR public.current_user_has_permission(institution_id, 'questions.edit')
);

-- G. Templates Update/Delete
DROP POLICY IF EXISTS templates_mutate_by_owner_or_admin ON public.institution_templates;
CREATE POLICY templates_mutate_by_owner_or_admin
ON public.institution_templates
FOR ALL
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR (
    created_by_user_id = auth.uid() 
    AND institution_id IN (SELECT public.current_user_institution_ids())
  )
  OR public.current_user_has_permission(institution_id, 'templates.edit')
);

-- H. Papers
-- Allow faculty to read/insert papers for their institution.
DROP POLICY IF EXISTS papers_select_by_membership ON public.institution_papers;
CREATE POLICY papers_select_by_membership
ON public.institution_papers
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR institution_id IN (SELECT public.current_user_institution_ids())
);

DROP POLICY IF EXISTS papers_insert_by_permission ON public.institution_papers;
CREATE POLICY papers_insert_by_permission
ON public.institution_papers
FOR INSERT
TO authenticated
WITH CHECK (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'papers.generate')
);

-- I. Missing Indexes for auth.uid() performance
CREATE INDEX IF NOT EXISTS idx_inst_questions_created_by ON public.institution_questions(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_inst_templates_created_by ON public.institution_templates(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_inst_papers_created_by ON public.institution_papers(created_by_user_id);
CREATE INDEX IF NOT EXISTS idx_inst_users_user_id ON public.institution_users(user_id);
