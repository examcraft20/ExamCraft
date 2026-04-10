create table if not exists public.institution_campuses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  code text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_campuses_status_check check (status in ('active', 'archived'))
);

create table if not exists public.institution_departments (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  campus_id uuid references public.institution_campuses(id) on delete set null,
  name text not null,
  code text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_departments_status_check check (status in ('active', 'archived'))
);

create table if not exists public.institution_courses (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  department_id uuid references public.institution_departments(id) on delete set null,
  name text not null,
  code text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_courses_status_check check (status in ('active', 'archived'))
);

create table if not exists public.institution_terms (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  name text not null,
  code text,
  start_date date,
  end_date date,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_terms_status_check check (status in ('active', 'archived'))
);

create table if not exists public.institution_subjects (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  department_id uuid references public.institution_departments(id) on delete set null,
  course_id uuid references public.institution_courses(id) on delete set null,
  name text not null,
  code text,
  status text not null default 'active',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_subjects_status_check check (status in ('active', 'archived'))
);

create index if not exists idx_campuses_institution_id on public.institution_campuses(institution_id);
create index if not exists idx_departments_institution_id on public.institution_departments(institution_id);
create index if not exists idx_courses_institution_id on public.institution_courses(institution_id);
create index if not exists idx_terms_institution_id on public.institution_terms(institution_id);
create index if not exists idx_subjects_institution_id on public.institution_subjects(institution_id);

drop trigger if exists trg_institution_campuses_set_updated_at on public.institution_campuses;
create trigger trg_institution_campuses_set_updated_at
before update on public.institution_campuses
for each row
execute function public.set_updated_at();

drop trigger if exists trg_institution_departments_set_updated_at on public.institution_departments;
create trigger trg_institution_departments_set_updated_at
before update on public.institution_departments
for each row
execute function public.set_updated_at();

drop trigger if exists trg_institution_courses_set_updated_at on public.institution_courses;
create trigger trg_institution_courses_set_updated_at
before update on public.institution_courses
for each row
execute function public.set_updated_at();

drop trigger if exists trg_institution_terms_set_updated_at on public.institution_terms;
create trigger trg_institution_terms_set_updated_at
before update on public.institution_terms
for each row
execute function public.set_updated_at();

drop trigger if exists trg_institution_subjects_set_updated_at on public.institution_subjects;
create trigger trg_institution_subjects_set_updated_at
before update on public.institution_subjects
for each row
execute function public.set_updated_at();

alter table public.institution_campuses enable row level security;
alter table public.institution_departments enable row level security;
alter table public.institution_courses enable row level security;
alter table public.institution_terms enable row level security;
alter table public.institution_subjects enable row level security;

drop policy if exists campuses_select_by_membership on public.institution_campuses;
create policy campuses_select_by_membership
on public.institution_campuses
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists campuses_insert_by_permission on public.institution_campuses;
create policy campuses_insert_by_permission
on public.institution_campuses
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists campuses_update_by_permission on public.institution_campuses;
create policy campuses_update_by_permission
on public.institution_campuses
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists departments_select_by_membership on public.institution_departments;
create policy departments_select_by_membership
on public.institution_departments
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists departments_insert_by_permission on public.institution_departments;
create policy departments_insert_by_permission
on public.institution_departments
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists departments_update_by_permission on public.institution_departments;
create policy departments_update_by_permission
on public.institution_departments
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists courses_select_by_membership on public.institution_courses;
create policy courses_select_by_membership
on public.institution_courses
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists courses_insert_by_permission on public.institution_courses;
create policy courses_insert_by_permission
on public.institution_courses
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists courses_update_by_permission on public.institution_courses;
create policy courses_update_by_permission
on public.institution_courses
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists terms_select_by_membership on public.institution_terms;
create policy terms_select_by_membership
on public.institution_terms
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists terms_insert_by_permission on public.institution_terms;
create policy terms_insert_by_permission
on public.institution_terms
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists terms_update_by_permission on public.institution_terms;
create policy terms_update_by_permission
on public.institution_terms
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists subjects_select_by_membership on public.institution_subjects;
create policy subjects_select_by_membership
on public.institution_subjects
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists subjects_insert_by_permission on public.institution_subjects;
create policy subjects_insert_by_permission
on public.institution_subjects
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);

drop policy if exists subjects_update_by_permission on public.institution_subjects;
create policy subjects_update_by_permission
on public.institution_subjects
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'academic_structure.manage')
);
