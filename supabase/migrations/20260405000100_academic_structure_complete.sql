-- Migration: 20260405000100_academic_structure_complete.sql
-- Purpose: Complete academic structure with batches, faculty assignments, and RLS policies
-- Dependencies: 20260403000200_academic_structure.sql (basic tables exist)

-- ============================================================================
-- ENHANCE EXISTING TABLES
-- ============================================================================

-- Add missing columns to institution_departments
ALTER TABLE public.institution_departments 
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS head_user_id UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to institution_courses  
ALTER TABLE public.institution_courses
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER,
ADD COLUMN IF NOT EXISTS level TEXT CHECK (level IN ('undergraduate', 'postgraduate', 'doctoral')),
ADD COLUMN IF NOT EXISTS duration_semesters INTEGER,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Add missing columns to institution_subjects
ALTER TABLE public.institution_subjects
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS credits INTEGER,
ADD COLUMN IF NOT EXISTS subject_type TEXT CHECK (subject_type IN ('theory', 'practical', 'project', 'elective')),
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- CREATE BATCHES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.institution_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  course_id UUID NOT NULL REFERENCES public.institution_courses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  academic_year TEXT NOT NULL,
  semester INTEGER CHECK (semester BETWEEN 1 AND 8),
  start_date DATE,
  end_date DATE,
  capacity INTEGER,
  enrolled_count INTEGER DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(institution_id, course_id, code)
);

CREATE INDEX IF NOT EXISTS idx_batches_institution_id ON public.institution_batches(institution_id);
CREATE INDEX IF NOT EXISTS idx_batches_course_id ON public.institution_batches(course_id);
CREATE INDEX IF NOT EXISTS idx_batches_academic_year ON public.institution_batches(academic_year);
CREATE INDEX IF NOT EXISTS idx_batches_status ON public.institution_batches(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_institution_batches_set_updated_at ON public.institution_batches;
CREATE TRIGGER trg_institution_batches_set_updated_at
  BEFORE UPDATE ON public.institution_batches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- CREATE FACULTY ASSIGNMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.faculty_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.institution_departments(id) ON DELETE SET NULL,
  batch_id UUID REFERENCES public.institution_batches(id) ON DELETE SET NULL,
  subject_id UUID REFERENCES public.institution_subjects(id) ON DELETE SET NULL,
  role TEXT NOT NULL DEFAULT 'faculty' CHECK (role IN ('faculty', 'head_of_department', 'academic_head', 'reviewer')),
  is_primary BOOLEAN DEFAULT false,
  assigned_from DATE,
  assigned_to DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT faculty_assignment_unique UNIQUE (user_id, batch_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_faculty_assignments_institution_id ON public.faculty_assignments(institution_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_user_id ON public.faculty_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_batch_id ON public.faculty_assignments(batch_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_subject_id ON public.faculty_assignments(subject_id);
CREATE INDEX IF NOT EXISTS idx_faculty_assignments_role ON public.faculty_assignments(role);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_faculty_assignments_set_updated_at ON public.faculty_assignments;
CREATE TRIGGER trg_faculty_assignments_set_updated_at
  BEFORE UPDATE ON public.faculty_assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- CREATE STUDENT ENROLLMENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.student_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  institution_id UUID NOT NULL REFERENCES public.institutions(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  batch_id UUID NOT NULL REFERENCES public.institution_batches(id) ON DELETE CASCADE,
  enrollment_date DATE DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'withdrawn', 'suspended')),
  roll_number TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, batch_id)
);

CREATE INDEX IF NOT EXISTS idx_enrollments_institution_id ON public.student_enrollments(institution_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON public.student_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_batch_id ON public.student_enrollments(batch_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON public.student_enrollments(status);

-- Trigger for updated_at
DROP TRIGGER IF EXISTS trg_student_enrollments_set_updated_at ON public.student_enrollments;
CREATE TRIGGER trg_student_enrollments_set_updated_at
  BEFORE UPDATE ON public.student_enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE public.institution_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faculty_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_enrollments ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP OLD BROKEN POLICIES
-- The original CREATE POLICY used ""name"" (double-double-quotes), which stores
-- the policy name with embedded literal quote characters. Drop both variants to
-- handle any environment where this migration was partially applied.
-- ============================================================================

DROP POLICY IF EXISTS "institution_batches_tenant_isolation"   ON public.institution_batches;
DROP POLICY IF EXISTS "institution_batches_authenticated_access" ON public.institution_batches;
DROP POLICY IF EXISTS "institution_batches_admin_insert"        ON public.institution_batches;
DROP POLICY IF EXISTS "institution_batches_admin_update"        ON public.institution_batches;
DROP POLICY IF EXISTS "institution_batches_admin_delete"        ON public.institution_batches;

DROP POLICY IF EXISTS "faculty_assignments_tenant_isolation" ON public.faculty_assignments;
DROP POLICY IF EXISTS "faculty_assignments_view_own"         ON public.faculty_assignments;
DROP POLICY IF EXISTS "faculty_assignments_admin_manage"     ON public.faculty_assignments;

DROP POLICY IF EXISTS "student_enrollments_tenant_isolation" ON public.student_enrollments;
DROP POLICY IF EXISTS "student_enrollments_view_own"         ON public.student_enrollments;
DROP POLICY IF EXISTS "student_enrollments_admin_manage"     ON public.student_enrollments;

-- Also drop unquoted variants in case Postgres normalised the name on creation
DROP POLICY IF EXISTS institution_batches_tenant_isolation    ON public.institution_batches;
DROP POLICY IF EXISTS institution_batches_authenticated_access ON public.institution_batches;
DROP POLICY IF EXISTS institution_batches_admin_insert        ON public.institution_batches;
DROP POLICY IF EXISTS institution_batches_admin_update        ON public.institution_batches;
DROP POLICY IF EXISTS institution_batches_admin_delete        ON public.institution_batches;

DROP POLICY IF EXISTS faculty_assignments_tenant_isolation ON public.faculty_assignments;
DROP POLICY IF EXISTS faculty_assignments_view_own         ON public.faculty_assignments;
DROP POLICY IF EXISTS faculty_assignments_admin_manage     ON public.faculty_assignments;

DROP POLICY IF EXISTS student_enrollments_tenant_isolation ON public.student_enrollments;
DROP POLICY IF EXISTS student_enrollments_view_own         ON public.student_enrollments;
DROP POLICY IF EXISTS student_enrollments_admin_manage     ON public.student_enrollments;

-- ============================================================================
-- INSTITUTION_BATCHES
--
-- SELECT  : any active member of the institution (same pattern as
--           questions_select_by_membership in migration 02).
-- INSERT  : holders of academic_structure.manage — institution_admin and
--           academic_head both carry this permission (see migration 01 seed).
-- UPDATE  : same gate as INSERT.
-- DELETE  : same gate as INSERT.
-- ============================================================================

DROP POLICY IF EXISTS batches_select_by_membership    ON public.institution_batches;
DROP POLICY IF EXISTS batches_insert_by_permission    ON public.institution_batches;
DROP POLICY IF EXISTS batches_update_by_permission    ON public.institution_batches;
DROP POLICY IF EXISTS batches_delete_by_permission    ON public.institution_batches;

CREATE POLICY batches_select_by_membership
ON public.institution_batches
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR institution_id IN (SELECT public.current_user_institution_ids())
);

CREATE POLICY batches_insert_by_permission
ON public.institution_batches
FOR INSERT
TO authenticated
WITH CHECK (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY batches_update_by_permission
ON public.institution_batches
FOR UPDATE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY batches_delete_by_permission
ON public.institution_batches
FOR DELETE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

-- ============================================================================
-- FACULTY_ASSIGNMENTS
--
-- SELECT  : the assigned faculty member themselves (user_id = auth.uid()) OR
--           any holder of academic_structure.manage in that institution.
-- INSERT/UPDATE/DELETE : academic_structure.manage gate only.
-- ============================================================================

DROP POLICY IF EXISTS faculty_assignments_select    ON public.faculty_assignments;
DROP POLICY IF EXISTS faculty_assignments_insert_by_permission ON public.faculty_assignments;
DROP POLICY IF EXISTS faculty_assignments_update_by_permission ON public.faculty_assignments;
DROP POLICY IF EXISTS faculty_assignments_delete_by_permission ON public.faculty_assignments;

CREATE POLICY faculty_assignments_select
ON public.faculty_assignments
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR user_id = auth.uid()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY faculty_assignments_insert_by_permission
ON public.faculty_assignments
FOR INSERT
TO authenticated
WITH CHECK (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY faculty_assignments_update_by_permission
ON public.faculty_assignments
FOR UPDATE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY faculty_assignments_delete_by_permission
ON public.faculty_assignments
FOR DELETE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

-- ============================================================================
-- STUDENT_ENROLLMENTS
--
-- SELECT  : the enrolled student themselves (user_id = auth.uid()) OR any
--           holder of users.manage in that institution (institution_admin holds
--           this; faculty view via academic_structure.manage as a second path).
-- INSERT/UPDATE/DELETE : academic_structure.manage gate (admin + academic_head).
-- ============================================================================

DROP POLICY IF EXISTS student_enrollments_select    ON public.student_enrollments;
DROP POLICY IF EXISTS student_enrollments_insert_by_permission ON public.student_enrollments;
DROP POLICY IF EXISTS student_enrollments_update_by_permission ON public.student_enrollments;
DROP POLICY IF EXISTS student_enrollments_delete_by_permission ON public.student_enrollments;

CREATE POLICY student_enrollments_select
ON public.student_enrollments
FOR SELECT
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR user_id = auth.uid()
  OR public.current_user_has_permission(institution_id, 'users.manage')
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY student_enrollments_insert_by_permission
ON public.student_enrollments
FOR INSERT
TO authenticated
WITH CHECK (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY student_enrollments_update_by_permission
ON public.student_enrollments
FOR UPDATE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

CREATE POLICY student_enrollments_delete_by_permission
ON public.student_enrollments
FOR DELETE
TO authenticated
USING (
  public.jwt_is_super_admin()
  OR public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.institution_batches IS 'Academic batches/sections for courses';
COMMENT ON TABLE public.faculty_assignments IS 'Maps faculty members to departments, batches, and subjects';
COMMENT ON TABLE public.student_enrollments IS 'Tracks student enrollments in batches';

COMMENT ON COLUMN public.institution_batches.academic_year IS 'Format: YYYY-YYYY (e.g., 2024-2025)';
COMMENT ON COLUMN public.institution_batches.semester IS 'Semester number (1-8)';
COMMENT ON COLUMN public.faculty_assignments.role IS 'Faculty role: faculty, head_of_department, academic_head, reviewer';
COMMENT ON COLUMN public.faculty_assignments.is_primary IS 'Primary instructor for the batch/subject combination';
COMMENT ON COLUMN public.student_enrollments.roll_number IS 'Institution-specific student roll/enrollment number';

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to verify)
-- ============================================================================

-- Verify tables exist
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE 'institution_%' ORDER BY table_name;

-- Verify RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('institution_batches', 'faculty_assignments', 'student_enrollments');

-- Verify indexes
-- SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('institution_batches', 'faculty_assignments', 'student_enrollments') ORDER BY indexname;
