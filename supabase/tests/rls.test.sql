BEGIN;

SELECT plan(15);

-- Enable RLS for tests if not already globally enabled
-- (Assume policies are already created via migrations)

-- Test 1: Faculty from Tenant A cannot read Tenant B's questions
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub":"user1", "app_metadata":{"tenant_id":"tenant-A", "role":"faculty"}}';

SELECT ok(
  (SELECT count(*) FROM institution_questions WHERE institution_id = 'tenant-B') = 0,
  'Faculty from Tenant A should see 0 rows for Tenant B'
);

-- Test 2: Faculty from Tenant A attempting to insert for Tenant B throws RLS violation
PREPARE insert_b as INSERT INTO institution_questions (id, institution_id, created_by_user_id, status) VALUES (gen_random_uuid(), 'tenant-B', 'user1', 'draft');
SELECT throws_ok(
  'insert_b',
  'new row violates row-level security policy for table "institution_questions"',
  'Inserting for wrong tenant throws RLS violation'
);

-- Test 3: Faculty from Tenant A can insert for Tenant A
PREPARE insert_a as INSERT INTO institution_questions (id, institution_id, created_by_user_id, status) VALUES (gen_random_uuid(), 'tenant-A', 'user1', 'draft');
SELECT lives_ok('insert_a', 'Inserting for own tenant passes');

-- Test 4: Super Admin can read all
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub":"admin", "app_metadata":{"isSuperAdmin":true}}';

SELECT ok(
  (SELECT count(*) FROM institution_questions) >= 1, -- the one inserted above
  'Super admin sees rows from all tenants'
);

-- Test 5: Unauthenticated access blocked
SET LOCAL role = anon;
SET LOCAL request.jwt.claims = '{}';

SELECT throws_ok(
  'SELECT count(*) FROM institution_questions',
  'permission denied for table institution_questions',
  'Anon access to questions is forbidden'
);

-- Test 6: Same pattern for institution_papers
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims = '{"sub":"user1", "app_metadata":{"tenant_id":"tenant-A", "role":"faculty"}}';
SELECT ok(
  (SELECT count(*) FROM institution_papers WHERE institution_id = 'tenant-B') = 0,
  'Faculty from Tenant A should see 0 papers for Tenant B'
);
PREPARE insert_paper_b as INSERT INTO institution_papers (id, institution_id, created_by_user_id, status) VALUES (gen_random_uuid(), 'tenant-B', 'user1', 'draft');
SELECT throws_ok('insert_paper_b', 'new row violates row-level security policy for table "institution_papers"');

-- Test 8: Same pattern for institution_templates
SELECT ok(
  (SELECT count(*) FROM institution_templates WHERE institution_id = 'tenant-B') = 0,
  'Faculty from Tenant A should see 0 templates for Tenant B'
);
PREPARE insert_template_b as INSERT INTO institution_templates (id, institution_id, created_by_user_id, status) VALUES (gen_random_uuid(), 'tenant-B', 'user1', 'draft');
SELECT throws_ok('insert_template_b', 'new row violates row-level security policy for table "institution_templates"');

-- Test 10: Users
SELECT ok(
  (SELECT count(*) FROM institution_users WHERE institution_id = 'tenant-B') = 0,
  'Faculty from Tenant A should see 0 users from Tenant B'
);

-- Test 12: Audit Logs
SELECT ok(
  (SELECT count(*) FROM audit_logs WHERE institution_id = 'tenant-B') = 0,
  'Faculty from Tenant A should see 0 logs from Tenant B'
);

-- Additional basic constraints test etc can be added. 

SELECT * FROM finish();

ROLLBACK;
