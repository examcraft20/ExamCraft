-- CQ-M1: Standardize Naming Conventions
-- Rename tenant-scoped tables to use the institution_* prefix

-- 1. Audit Logs
ALTER TABLE audit_logs RENAME TO institution_audit_logs;
ALTER INDEX idx_audit_logs_institution_created RENAME TO idx_inst_audit_logs_inst_created;
ALTER INDEX idx_audit_logs_resource RENAME TO idx_inst_audit_logs_resource;
ALTER INDEX idx_audit_logs_user RENAME TO idx_inst_audit_logs_user;

-- 2. Usage Metrics
ALTER TABLE usage_metrics RENAME TO institution_usage_metrics;

-- 3. Subscriptions
ALTER TABLE subscriptions RENAME TO institution_subscriptions;

-- Update RLS policy names (Postgres doesn't automatically rename them, but the logic remains)
-- Actually renaming policies requires dropping and recreating, which might be overkill,
-- but standardizing table names is the priority.
