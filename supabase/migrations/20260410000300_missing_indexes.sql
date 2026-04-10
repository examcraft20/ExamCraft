CREATE INDEX IF NOT EXISTS idx_institution_questions_status_created
  ON institution_questions(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_institution_papers_status_created
  ON institution_papers(status, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_institution_users_status_institution
  ON institution_users(status, institution_id);
