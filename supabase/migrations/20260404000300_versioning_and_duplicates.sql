create table if not exists public.institution_question_versions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade not null,
  question_id uuid references public.institution_questions(id) on delete cascade not null,
  version_number integer not null,
  title text not null,
  subject text not null,
  bloom_level text not null,
  difficulty text not null,
  tags text[],
  course_outcomes text[],
  unit_number integer,
  department_id uuid references public.institution_departments(id) on delete set null,
  course_id uuid references public.institution_courses(id) on delete set null,
  edited_by_user_id uuid references auth.users(id) on delete set null,
  change_summary text,
  created_at timestamptz not null default timezone('utc', now()),
  unique(question_id, version_number)
);

create table if not exists public.institution_question_duplicates (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid references public.institutions(id) on delete cascade not null,
  primary_question_id uuid references public.institution_questions(id) on delete cascade not null,
  similar_question_id uuid references public.institution_questions(id) on delete cascade not null,
  similarity_score numeric not null check (similarity_score >= 0 and similarity_score <= 100),
  status text not null default 'pending' check (status in ('pending', 'ignored', 'merged')),
  resolved_by_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default timezone('utc', now()),
  resolved_at timestamptz
);

-- Indices for performance
create index if not exists idx_question_versions_qid on public.institution_question_versions(question_id);
create index if not exists idx_question_duplicates_primary on public.institution_question_duplicates(primary_question_id);

-- Enable RLS
alter table public.institution_question_versions enable row level security;
alter table public.institution_question_duplicates enable row level security;

-- Policies for Versions
create policy versions_select_by_membership on public.institution_question_versions
for select to authenticated
using (public.jwt_is_super_admin() or institution_id in (select public.current_user_institution_ids()));

create policy versions_insert_by_permission on public.institution_question_versions
for insert to authenticated
with check (public.jwt_is_super_admin() or public.current_user_has_permission(institution_id, 'questions.create') or public.current_user_has_permission(institution_id, 'papers.review'));

-- Policies for Duplicates
create policy duplicates_select_by_membership on public.institution_question_duplicates
for select to authenticated
using (public.jwt_is_super_admin() or institution_id in (select public.current_user_institution_ids()));
