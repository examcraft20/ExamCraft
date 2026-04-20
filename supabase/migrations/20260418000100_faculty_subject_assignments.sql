-- Migration: Faculty Subject Assignments
-- Created: 2026-04-18
-- Description: Adds a bridging table to restrict faculty access to specific subjects.

create table if not exists public.faculty_subject_assignments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  institution_user_id uuid not null references public.institution_users(id) on delete cascade,
  subject_id uuid not null references public.institution_subjects(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  
  -- Prevent duplicate assignments
  unique(institution_user_id, subject_id)
);

-- Indices for performance
create index idx_faculty_subject_inst_id on public.faculty_subject_assignments(institution_id);
create index idx_faculty_subject_user_id on public.faculty_subject_assignments(institution_user_id);

-- Enable RLS
alter table public.faculty_subject_assignments enable row level security;

-- Policies
-- 1. Everyone in the institution can see assignments (to know who teaches what)
create policy "Assignments are viewable by institution members"
on public.faculty_subject_assignments
for select
to authenticated
using (
  institution_id in (select public.current_user_institution_ids())
);

-- 2. Only Admins and Academic Heads can manage assignments
create policy "Assignments are manageable by admins and heads"
on public.faculty_subject_assignments
for all
to authenticated
using (
  public.current_user_has_permission(institution_id, 'users.manage')
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
)
with check (
  public.current_user_has_permission(institution_id, 'users.manage')
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);
