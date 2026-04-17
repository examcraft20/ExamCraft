-- RPC to get platform dashboard summary in a single query
CREATE OR REPLACE FUNCTION get_platform_dashboard_summary()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_institutions_count INT;
  v_active_users_count INT;
  v_pending_invitations_count INT;
  v_questions_count INT;
  v_templates_count INT;
  v_recent_institutions JSONB;
  v_result JSONB;
BEGIN
  -- Count metrics
  SELECT COUNT(id) INTO v_institutions_count FROM institutions;
  SELECT COUNT(id) INTO v_active_users_count FROM institution_users WHERE status = 'active';
  SELECT COUNT(id) INTO v_pending_invitations_count FROM invitations WHERE status = 'pending';
  SELECT COUNT(id) INTO v_questions_count FROM institution_questions;
  SELECT COUNT(id) INTO v_templates_count FROM institution_templates;

  -- Recent items
  SELECT COALESCE(jsonb_agg(inst), '[]'::jsonb) INTO v_recent_institutions
  FROM (
    SELECT id, name, slug, institution_type as "institutionType", status, created_at as "createdAt"
    FROM institutions
    ORDER BY created_at DESC
    LIMIT 8
  ) inst;

  -- Build final JSON result
  v_result := jsonb_build_object(
    'totals', jsonb_build_object(
      'institutions', COALESCE(v_institutions_count, 0),
      'activeUsers', COALESCE(v_active_users_count, 0),
      'pendingInvitations', COALESCE(v_pending_invitations_count, 0),
      'questions', COALESCE(v_questions_count, 0),
      'templates', COALESCE(v_templates_count, 0)
    ),
    'recentInstitutions', v_recent_institutions
  );

  RETURN v_result;
END;
$$;
