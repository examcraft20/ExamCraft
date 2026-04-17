-- Create feature flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  key VARCHAR(255) PRIMARY KEY,
  enabled BOOLEAN NOT NULL DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Turn on RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Base Policies
CREATE POLICY "Feature flags are completely readable by everyone" ON public.feature_flags FOR SELECT USING (true);
-- Only supabase_admin handles DML internally for flags
