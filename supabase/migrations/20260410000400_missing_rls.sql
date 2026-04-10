-- Add missing RLS policies
-- 1. institution_papers DELETE (only institution_admin / academic_head)
CREATE POLICY papers_delete_by_role ON public.institution_papers
FOR DELETE TO authenticated
USING (
  public.jwt_is_super_admin()
  OR EXISTS (
    SELECT 1 FROM public.institution_users iu
    JOIN public.institution_user_roles iur ON iu.id = iur.institution_user_id
    JOIN public.roles r ON r.id = iur.role_id
    WHERE iu.user_id = auth.uid()
      AND iu.institution_id = institution_papers.institution_id
      AND iu.status = 'active'
      AND r.code IN ('institution_admin', 'academic_head')
  )
);

-- 2. subscriptions SELECT/UPDATE (institution_admin only)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY subscriptions_select_by_admin ON public.subscriptions
FOR SELECT TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'institution.manage')
);

CREATE POLICY subscriptions_update_by_admin ON public.subscriptions
FOR UPDATE TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'institution.manage')
);

-- 3. usage_metrics SELECT (institution_admin only)
ALTER TABLE public.usage_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY usage_metrics_select_by_admin ON public.usage_metrics
FOR SELECT TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'institution.manage')
);

-- 4. roles and permissions SELECT (authenticated)
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY roles_select_all ON public.roles
FOR SELECT TO authenticated
USING (true);

ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY permissions_select_all ON public.permissions
FOR SELECT TO authenticated
USING (true);

-- 5. role_permissions SELECT (authenticated)
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY role_permissions_select_all ON public.role_permissions
FOR SELECT TO authenticated
USING (true);

