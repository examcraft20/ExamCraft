CREATE OR REPLACE FUNCTION get_institution_stats(p_institution_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_total_questions BIGINT;
  v_total_papers BIGINT;
  v_recent_papers BIGINT;
  v_pending_approvals BIGINT;
  v_approved_published BIGINT;
  v_faculty_count BIGINT;
BEGIN
  -- 1. Total questions
  SELECT count(*) INTO v_total_questions 
  FROM institution_questions 
  WHERE institution_id = p_institution_id;

  -- 2. Total papers
  SELECT count(*) INTO v_total_papers 
  FROM institution_papers 
  WHERE institution_id = p_institution_id;

  -- 3. Recent papers (30 days)
  SELECT count(*) INTO v_recent_papers 
  FROM institution_papers 
  WHERE institution_id = p_institution_id 
    AND created_at >= NOW() - INTERVAL '30 days';

  -- 4. Pending approvals
  SELECT count(*) INTO v_pending_approvals 
  FROM institution_papers 
  WHERE institution_id = p_institution_id 
    AND status IN ('submitted', 'in_review');

  -- 5. Approved/Published
  SELECT count(*) INTO v_approved_published 
  FROM institution_papers 
  WHERE institution_id = p_institution_id 
    AND status IN ('approved', 'published');

  -- 6. Faculty count
  SELECT count(*) INTO v_faculty_count 
  FROM institution_users 
  WHERE institution_id = p_institution_id;

  RETURN jsonb_build_object(
    'totalQuestions', v_total_questions,
    'papersGeneratedAllTime', v_total_papers,
    'papersGeneratedLast30Days', v_recent_papers,
    'pendingApprovals', v_pending_approvals,
    'approvedAndPublished', v_approved_published,
    'activeFacultyCount', v_faculty_count
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
