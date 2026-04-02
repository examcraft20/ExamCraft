create or replace function public.jwt_is_super_admin()
returns boolean
language sql
stable
as $$
  select coalesce(
    (auth.jwt() -> 'app_metadata' -> 'roles') ? 'super_admin',
    false
  );
$$;

create or replace function public.current_user_institution_ids()
returns setof uuid
language sql
stable
as $$
  select iu.institution_id
  from public.institution_users iu
  where iu.user_id = auth.uid()
    and iu.status = 'active';
$$;

create or replace function public.current_user_has_permission(target_institution_id uuid, permission_code text)
returns boolean
language sql
stable
as $$
  select
    public.jwt_is_super_admin()
    or exists (
      select 1
      from public.institution_users iu
      join public.institution_user_roles iur on iur.institution_user_id = iu.id
      join public.role_permissions rp on rp.role_id = iur.role_id
      join public.permissions p on p.id = rp.permission_id
      where iu.user_id = auth.uid()
        and iu.status = 'active'
        and iu.institution_id = target_institution_id
        and p.code = permission_code
    );
$$;

create table if not exists public.institution_questions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  subject text not null,
  bloom_level text not null,
  difficulty text not null,
  tags text[] not null default '{}',
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_questions_difficulty_check check (difficulty in ('easy', 'medium', 'hard')),
  constraint institution_questions_status_check check (status in ('draft', 'ready', 'archived'))
);

create table if not exists public.institution_templates (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  exam_type text not null,
  duration_minutes integer not null,
  total_marks integer not null,
  sections jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint institution_templates_duration_check check (duration_minutes > 0),
  constraint institution_templates_marks_check check (total_marks > 0),
  constraint institution_templates_status_check check (status in ('draft', 'published', 'archived'))
);

create index if not exists idx_institution_questions_institution_id
  on public.institution_questions(institution_id, created_at desc);

create index if not exists idx_institution_templates_institution_id
  on public.institution_templates(institution_id, created_at desc);

drop trigger if exists trg_institution_questions_set_updated_at on public.institution_questions;
create trigger trg_institution_questions_set_updated_at
before update on public.institution_questions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_institution_templates_set_updated_at on public.institution_templates;
create trigger trg_institution_templates_set_updated_at
before update on public.institution_templates
for each row
execute function public.set_updated_at();

alter table public.institutions enable row level security;
alter table public.institution_users enable row level security;
alter table public.invitations enable row level security;
alter table public.institution_questions enable row level security;
alter table public.institution_templates enable row level security;

drop policy if exists institutions_select_by_membership on public.institutions;
create policy institutions_select_by_membership
on public.institutions
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or id in (select public.current_user_institution_ids())
);

drop policy if exists institution_users_select_by_membership on public.institution_users;
create policy institution_users_select_by_membership
on public.institution_users
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists invitations_select_by_permission on public.invitations;
create policy invitations_select_by_permission
on public.invitations
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'users.manage')
);

drop policy if exists questions_select_by_membership on public.institution_questions;
create policy questions_select_by_membership
on public.institution_questions
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists questions_insert_by_permission on public.institution_questions;
create policy questions_insert_by_permission
on public.institution_questions
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'questions.create')
);

drop policy if exists templates_select_by_membership on public.institution_templates;
create policy templates_select_by_membership
on public.institution_templates
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists templates_insert_by_permission on public.institution_templates;
create policy templates_insert_by_permission
on public.institution_templates
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'templates.create')
);
