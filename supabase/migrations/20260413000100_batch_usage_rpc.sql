CREATE OR REPLACE FUNCTION get_batch_institution_usage(p_institution_ids UUID[])
RETURNS TABLE (
  institution_id UUID,
  active_users BIGINT,
  pending_invitations BIGINT,
  questions BIGINT,
  templates BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    id AS institution_id,
    (SELECT count(*) FROM institution_users WHERE institution_id = i.id AND status = 'active') AS active_users,
    (SELECT count(*) FROM invitations WHERE institution_id = i.id AND status = 'pending') AS pending_invitations,
    (SELECT count(*) FROM institution_questions WHERE institution_id = i.id) AS questions,
    (SELECT count(*) FROM institution_templates WHERE institution_id = i.id) AS templates
  FROM institutions i
  WHERE i.id = ANY(p_institution_ids);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
