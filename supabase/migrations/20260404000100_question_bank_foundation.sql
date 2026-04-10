create table if not exists public.institution_topics (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade not null,
  subject_id uuid references public.institution_subjects(id) on delete cascade not null,
  name text not null,
  unit_number integer,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.institution_learning_outcomes (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade not null,
  subject_id uuid references public.institution_subjects(id) on delete cascade not null,
  code text not null, -- e.g. CO1, CO2
  description text not null,
  created_at timestamptz not null default timezone('utc', now())
);

-- Question modifications using dedicated mapping tables instead of arrays, 
-- or adding columns directly to institution_questions if keeping it flat.
-- The prototype used arrays for COs and single string for unit. 
alter table public.institution_questions 
add column if not exists course_outcomes text[] default '{}',
add column if not exists unit_number integer,
add column if not exists department_id uuid references public.institution_departments(id) on delete set null,
add column if not exists course_id uuid references public.institution_courses(id) on delete set null;

create index if not exists idx_topics_subject on public.institution_topics(subject_id);
create index if not exists idx_outcomes_subject on public.institution_learning_outcomes(subject_id);

alter table public.institution_topics enable row level security;
alter table public.institution_learning_outcomes enable row level security;

-- Policies for Topics
create policy topics_select_by_membership on public.institution_topics
for select to authenticated
using (public.jwt_is_super_admin() or institution_id in (select public.current_user_institution_ids()));

create policy topics_insert_by_permission on public.institution_topics
for insert to authenticated
with check (public.jwt_is_super_admin() or public.current_user_has_permission(institution_id, 'academic_structure.manage') or public.current_user_has_permission(institution_id, 'questions.create'));

-- Policies for Learning Outcomes
create policy outcomes_select_by_membership on public.institution_learning_outcomes
for select to authenticated
using (public.jwt_is_super_admin() or institution_id in (select public.current_user_institution_ids()));

create policy outcomes_insert_by_permission on public.institution_learning_outcomes
for insert to authenticated
with check (public.jwt_is_super_admin() or public.current_user_has_permission(institution_id, 'academic_structure.manage') or public.current_user_has_permission(institution_id, 'questions.create'));
