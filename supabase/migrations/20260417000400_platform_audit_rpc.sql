-- RPC to get platform audit feed
CREATE OR REPLACE FUNCTION get_platform_audit_feed()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_events JSONB;
BEGIN
  WITH combined_events AS (
    SELECT 
      i.id as id,
      i.id as institution_id,
      i.name as institution_name,
      'institution.created' as event_type,
      'Institution created: ' || i.name as title,
      i.status as status,
      i.created_at as created_at
    FROM institutions i
    ORDER BY created_at DESC LIMIT 6

    UNION ALL

    SELECT 
      inv.id as id,
      inv.institution_id as institution_id,
      i.name as institution_name,
      'invitation.created' as event_type,
      'Invitation sent to ' || inv.email as title,
      inv.status as status,
      inv.created_at as created_at
    FROM invitations inv
    LEFT JOIN institutions i ON i.id = inv.institution_id
    ORDER BY created_at DESC LIMIT 6

    UNION ALL

    SELECT 
      q.id as id,
      q.institution_id as institution_id,
      i.name as institution_name,
      'question.created' as event_type,
      'Question created: ' || q.title as title,
      q.status as status,
      q.created_at as created_at
    FROM institution_questions q
    LEFT JOIN institutions i ON i.id = q.institution_id
    ORDER BY created_at DESC LIMIT 6

    UNION ALL

    SELECT 
      t.id as id,
      t.institution_id as institution_id,
      i.name as institution_name,
      'template.created' as event_type,
      'Template created: ' || t.name as title,
      t.status as status,
      t.created_at as created_at
    FROM institution_templates t
    LEFT JOIN institutions i ON i.id = t.institution_id
    ORDER BY created_at DESC LIMIT 6
  ),
  sorted_events AS (
    SELECT * FROM combined_events ORDER BY created_at DESC LIMIT 12
  )
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', id,
      'institutionId', institution_id,
      'institutionName', institution_name,
      'eventType', event_type,
      'title', title,
      'status', status,
      'createdAt', created_at
    )
  ), '[]'::jsonb) INTO v_events
  FROM sorted_events;

  RETURN v_events;
END;
$$;
