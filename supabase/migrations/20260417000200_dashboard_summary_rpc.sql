-- RPC to get institution dashboard summary in a single query
CREATE OR REPLACE FUNCTION get_institution_dashboard_summary(p_institution_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_users_count INT;
  v_invitations_count INT;
  v_questions_count INT;
  v_templates_count INT;
  v_recent_invitations JSONB;
  v_recent_questions JSONB;
  v_recent_templates JSONB;
  v_result JSONB;
BEGIN
  -- Count metrics
  SELECT COUNT(id) INTO v_users_count FROM institution_users WHERE institution_id = p_institution_id;
  SELECT COUNT(id) INTO v_invitations_count FROM invitations WHERE institution_id = p_institution_id;
  SELECT COUNT(id) INTO v_questions_count FROM institution_questions WHERE institution_id = p_institution_id;
  SELECT COUNT(id) INTO v_templates_count FROM institution_templates WHERE institution_id = p_institution_id;

  -- Recent items
  SELECT COALESCE(jsonb_agg(inv), '[]'::jsonb) INTO v_recent_invitations
  FROM (
    SELECT id, email, role_code as "roleCode", status, created_at as "createdAt"
    FROM invitations
    WHERE institution_id = p_institution_id
    ORDER BY created_at DESC
    LIMIT 5
  ) inv;

  SELECT COALESCE(jsonb_agg(q), '[]'::jsonb) INTO v_recent_questions
  FROM (
    SELECT id, title, subject, difficulty, status, created_at as "createdAt"
    FROM institution_questions
    WHERE institution_id = p_institution_id
    ORDER BY created_at DESC
    LIMIT 5
  ) q;

  SELECT COALESCE(jsonb_agg(t), '[]'::jsonb) INTO v_recent_templates
  FROM (
    SELECT id, name, exam_type as "examType", status, created_at as "createdAt"
    FROM institution_templates
    WHERE institution_id = p_institution_id
    ORDER BY created_at DESC
    LIMIT 5
  ) t;

  -- Build final JSON result
  v_result := jsonb_build_object(
    'totals', jsonb_build_object(
      'users', COALESCE(v_users_count, 0),
      'invitations', COALESCE(v_invitations_count, 0),
      'questions', COALESCE(v_questions_count, 0),
      'templates', COALESCE(v_templates_count, 0)
    ),
    'recentInvitations', v_recent_invitations,
    'recentQuestions', v_recent_questions,
    'recentTemplates', v_recent_templates
  );

  RETURN v_result;
END;
$$;
