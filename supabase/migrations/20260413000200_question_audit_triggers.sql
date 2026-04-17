-- 3D. Question status change trigger
CREATE OR REPLACE FUNCTION audit_question_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO institution_audit_logs (institution_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      NEW.institution_id, auth.uid(),
      'QUESTION_STATUS_CHANGED', 'institution_questions', NEW.id,
      jsonb_build_object(
        'from', OLD.status, 
        'to', NEW.status, 
        'title', NEW.title,
        'comment', NEW.metadata->>'reviewComment'
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_audit_question_status
  AFTER UPDATE ON institution_questions
  FOR EACH ROW EXECUTE FUNCTION audit_question_status_changes();
