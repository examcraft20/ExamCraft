CREATE TABLE feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID REFERENCES institutions(id),
  flag_name TEXT NOT NULL,
  enabled BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, flag_name)
);

ALTER TABLE feature_flags ENABLE ROW LEVEL SECURITY;

CREATE POLICY feature_flags_select ON feature_flags
  FOR SELECT TO authenticated
  USING (
    institution_id IS NULL -- global flags visible to all
    OR public.current_user_has_permission(institution_id, 'settings.read')
  );

drop trigger if exists trg_feature_flags_set_updated_at on feature_flags;
create trigger trg_feature_flags_set_updated_at
before update on feature_flags
for each row
execute function public.set_updated_at();
