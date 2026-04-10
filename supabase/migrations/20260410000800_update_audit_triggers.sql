-- Update audit triggers to use the new institution_audit_logs table

CREATE OR REPLACE FUNCTION audit_paper_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO institution_audit_logs (institution_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      NEW.institution_id, auth.uid(),
      'PAPER_STATUS_CHANGED', 'institution_papers', NEW.id,
      jsonb_build_object('from', OLD.status, 'to', NEW.status, 'title', NEW.title)
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION audit_user_role_changes()
RETURNS TRIGGER AS $$
DECLARE
  v_institution_id uuid;
  v_old_role_code text;
  v_new_role_code text;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    SELECT institution_id INTO v_institution_id FROM public.institution_users WHERE id = NEW.institution_user_id;
    SELECT code INTO v_old_role_code FROM public.roles WHERE id = OLD.role_id;
    SELECT code INTO v_new_role_code FROM public.roles WHERE id = NEW.role_id;
    
    IF OLD.role_id IS DISTINCT FROM NEW.role_id THEN
      INSERT INTO institution_audit_logs (institution_id, user_id, action, resource_type, resource_id, metadata)
      VALUES (
        v_institution_id, auth.uid(),
        'USER_ROLE_CHANGED', 'institution_user_roles', NEW.institution_user_id,
        jsonb_build_object('from', v_old_role_code, 'to', v_new_role_code)
      );
    END IF;
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    SELECT institution_id INTO v_institution_id FROM public.institution_users WHERE id = NEW.institution_user_id;
    SELECT code INTO v_new_role_code FROM public.roles WHERE id = NEW.role_id;
    
    INSERT INTO institution_audit_logs (institution_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      v_institution_id, auth.uid(),
      'USER_ROLE_CHANGED', 'institution_user_roles', NEW.institution_user_id,
      jsonb_build_object('to', v_new_role_code)
    );
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT institution_id INTO v_institution_id FROM public.institution_users WHERE id = OLD.institution_user_id;
    SELECT code INTO v_old_role_code FROM public.roles WHERE id = OLD.role_id;
    
    INSERT INTO institution_audit_logs (institution_id, user_id, action, resource_type, resource_id, metadata)
    VALUES (
      v_institution_id, auth.uid(),
      'USER_ROLE_CHANGED', 'institution_user_roles', OLD.institution_user_id,
      jsonb_build_object('from', v_old_role_code, 'to', null)
    );
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION audit_question_deletion()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO institution_audit_logs (institution_id, user_id, action, resource_type, resource_id, metadata)
  VALUES (
    OLD.institution_id, auth.uid(),
    'QUESTION_DELETED', 'institution_questions', OLD.id,
    jsonb_build_object('title', OLD.title, 'subject', OLD.subject, 'difficulty', OLD.difficulty)
  );
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
