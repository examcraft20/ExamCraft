-- ============================================
-- ExamCraft Database Reset & Test Data Script
-- ============================================
-- This script clears all test data and creates fresh test users
-- Run this in Supabase SQL Editor or via CLI

-- 1. Clear existing data (in reverse dependency order)
DELETE FROM institution_user_roles;
DELETE FROM institution_users;
DELETE FROM institutions;
DELETE FROM auth.users WHERE email LIKE '%@testuniversity.edu';

-- 2. Create Test Institution
INSERT INTO institutions (id, name, slug, institution_type, primary_contact_email, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Test University',
  'test-university',
  'university',
  'admin@testuniversity.edu',
  'active',
  NOW(),
  NOW()
);

-- 3. Create Academic Structure for Test Institution

-- Departments
INSERT INTO institution_departments (id, institution_id, name, code, description, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000101', '00000000-0000-0000-0000-000000000001', 'Computer Science', 'CS', 'Department of Computer Science and Engineering', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000102', '00000000-0000-0000-0000-000000000001', 'Mathematics', 'MATH', 'Department of Mathematics', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000103', '00000000-0000-0000-0000-000000000001', 'Physics', 'PHY', 'Department of Physics', NOW(), NOW());

-- Courses
INSERT INTO institution_courses (id, institution_id, department_id, name, code, level, duration_semesters, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000201', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000101', 'B.Tech Computer Science', 'BT-CS', 'undergraduate', 8, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000202', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000102', 'B.Sc Mathematics', 'BS-MATH', 'undergraduate', 6, NOW(), NOW());

-- Batches
INSERT INTO institution_batches (id, institution_id, course_id, name, code, academic_year, start_date, end_date, status, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000301', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'CS 2024-28', 'CS-24', '2024-2028', '2024-08-01', '2028-06-30', 'active', NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000302', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'MATH 2024-27', 'MATH-24', '2024-2027', '2024-08-01', '2027-06-30', 'active', NOW(), NOW());

-- Subjects
INSERT INTO institution_subjects (id, institution_id, course_id, name, code, subject_type, credits, created_at, updated_at)
VALUES 
  ('00000000-0000-0000-0000-000000000401', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Data Structures', 'CS201', 'theory', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000402', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000201', 'Algorithms', 'CS202', 'theory', 4, NOW(), NOW()),
  ('00000000-0000-0000-0000-000000000403', '00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000202', 'Calculus', 'MATH101', 'theory', 4, NOW(), NOW());


-- ============================================
-- 4. Create Test Users (All roles)
-- ============================================
-- Password for all users: Test@123456

-- Create Mock Auth Users to satisfy foreign keys for new clean setup
INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at, recovery_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token)
VALUES
 ('00000000-0000-0000-0000-000000000501', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@testuniversity.edu', crypt('Test@123456', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Admin User"}', current_timestamp, current_timestamp, '', '', '', ''),
 ('00000000-0000-0000-0000-000000000502', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'head.cs@testuniversity.edu', crypt('Test@123456', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Dr. Sarah Johnson"}', current_timestamp, current_timestamp, '', '', '', ''),
 ('00000000-0000-0000-0000-000000000503', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'reviewer@testuniversity.edu', crypt('Test@123456', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Prof. Michael Chen"}', current_timestamp, current_timestamp, '', '', '', ''),
 ('00000000-0000-0000-0000-000000000504', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'faculty1@testuniversity.edu', crypt('Test@123456', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Dr. Emily Rodriguez"}', current_timestamp, current_timestamp, '', '', '', ''),
 ('00000000-0000-0000-0000-000000000505', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'faculty2@testuniversity.edu', crypt('Test@123456', gen_salt('bf')), current_timestamp, current_timestamp, current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Prof. James Wilson"}', current_timestamp, current_timestamp, '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Institution Admin
INSERT INTO institution_users (id, institution_id, user_id, display_name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000501',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000501',
  'Admin User',
  'active',
  NOW(),
  NOW()
);
INSERT INTO institution_user_roles (institution_user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000501', (SELECT id FROM roles WHERE code = 'institution_admin'));

-- Academic Head (Computer Science)
INSERT INTO institution_users (id, institution_id, user_id, display_name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000502',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000502',
  'Dr. Sarah Johnson',
  'active',
  NOW(),
  NOW()
);
INSERT INTO institution_user_roles (institution_user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000502', (SELECT id FROM roles WHERE code = 'academic_head'));

-- Reviewer/Approver
INSERT INTO institution_users (id, institution_id, user_id, display_name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000503',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000503',
  'Prof. Michael Chen',
  'active',
  NOW(),
  NOW()
);
INSERT INTO institution_user_roles (institution_user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000503', (SELECT id FROM roles WHERE code = 'reviewer_approver'));

-- Faculty Member (Computer Science)
INSERT INTO institution_users (id, institution_id, user_id, display_name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000504',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000504',
  'Dr. Emily Rodriguez',
  'active',
  NOW(),
  NOW()
);
INSERT INTO institution_user_roles (institution_user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000504', (SELECT id FROM roles WHERE code = 'faculty'));

-- Faculty Member (Mathematics)
INSERT INTO institution_users (id, institution_id, user_id, display_name, status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000505',
  '00000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000505',
  'Prof. James Wilson',
  'active',
  NOW(),
  NOW()
);
INSERT INTO institution_user_roles (institution_user_id, role_id)
VALUES ('00000000-0000-0000-0000-000000000505', (SELECT id FROM roles WHERE code = 'faculty'));
