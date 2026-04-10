-- Add academic structure to existing templates
alter table public.institution_templates 
add column if not exists department_id uuid references public.institution_departments(id) on delete set null,
add column if not exists course_id uuid references public.institution_courses(id) on delete set null,
add column if not exists subject_id uuid references public.institution_subjects(id) on delete set null;

-- Dedicated table for sections to allow granular rules/constraints
create table if not exists public.institution_template_sections (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.institution_templates(id) on delete cascade,
  title text not null,
  description text,
  question_count integer not null check (question_count > 0),
  marks_per_question integer not null check (marks_per_question > 0),
  section_order integer not null default 0,
  -- Constraints for auto-generation (e.g. difficulty distribution, Bloom taxonomy)
  auto_select_rules jsonb default '{}'::jsonb, 
  created_at timestamptz not null default timezone('utc', now())
);

-- Global/Public Template Library
create table if not exists public.global_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  exam_type text not null,
  description text,
  total_marks integer not null check (total_marks > 0),
  duration_minutes integer not null check (duration_minutes > 0),
  sections jsonb not null default '[]'::jsonb,
  tags text[] default '{}',
  is_verified boolean default false,
  created_at timestamptz not null default timezone('utc', now())
);

-- Enable RLS
alter table public.institution_template_sections enable row level security;
alter table public.global_templates enable row level security;

-- Policies for Sections
create policy sections_select_by_membership on public.institution_template_sections
for select to authenticated
using (
  public.jwt_is_super_admin()
  or exists (
    select 1 from public.institution_templates t
    where t.id = template_id
      and t.institution_id in (select public.current_user_institution_ids())
  )
);

create policy sections_modify_by_permission on public.institution_template_sections
for all to authenticated
using (
  public.jwt_is_super_admin()
  or exists (
    select 1 from public.institution_templates t
    where t.id = template_id
      and public.current_user_has_permission(t.institution_id, 'templates.create')
  )
);

-- Policies for Global Templates
create policy global_templates_read_all on public.global_templates
for select to authenticated
using (true);

-- Indices
create index if not exists idx_template_sections_tid on public.institution_template_sections(template_id);
