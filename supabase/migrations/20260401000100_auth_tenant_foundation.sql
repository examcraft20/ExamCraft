create extension if not exists pgcrypto;
create extension if not exists citext;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create table if not exists public.institutions (
  id uuid primary key default gen_random_uuid(),
  slug citext not null unique,
  name text not null,
  legal_name text,
  institution_type text not null,
  status text not null default 'active',
  branding jsonb not null default '{}'::jsonb,
  settings jsonb not null default '{}'::jsonb,
  primary_contact_name text,
  primary_contact_email citext,
  primary_contact_phone text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  deleted_at timestamptz,
  constraint institutions_status_check check (status in ('active', 'trial', 'suspended', 'archived'))
);

create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  scope text not null,
  description text,
  is_system boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint roles_scope_check check (scope in ('platform', 'institution'))
);

create table if not exists public.permissions (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  module text not null,
  description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.role_permissions (
  role_id uuid not null references public.roles(id) on delete cascade,
  permission_id uuid not null references public.permissions(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (role_id, permission_id)
);

create table if not exists public.institution_users (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  employee_code text,
  display_name text,
  status text not null default 'active',
  invited_by_user_id uuid references auth.users(id) on delete set null,
  joined_at timestamptz,
  last_active_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, user_id),
  constraint institution_users_status_check check (status in ('invited', 'active', 'disabled'))
);

create table if not exists public.institution_user_roles (
  institution_user_id uuid not null references public.institution_users(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  primary key (institution_user_id, role_id)
);

create table if not exists public.invitations (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  email citext not null,
  role_code text not null,
  status text not null default 'pending',
  token_hash text not null unique,
  invited_by_user_id uuid references auth.users(id) on delete set null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint invitations_status_check check (status in ('pending', 'accepted', 'revoked', 'expired'))
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null unique references public.institutions(id) on delete cascade,
  plan_code text not null default 'free',
  billing_status text not null default 'active',
  seats_included integer not null default 5,
  question_limit integer,
  monthly_generation_limit integer,
  current_period_start timestamptz not null default timezone('utc', now()),
  current_period_end timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  constraint subscriptions_plan_code_check check (plan_code in ('free', 'growth', 'enterprise')),
  constraint subscriptions_billing_status_check check (billing_status in ('active', 'trialing', 'past_due', 'canceled'))
);

create table if not exists public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  metric_date date not null,
  metric_code text not null,
  metric_value numeric(12, 2) not null default 0,
  dimension jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  unique (institution_id, metric_date, metric_code, dimension)
);

create index if not exists idx_roles_scope on public.roles(scope);
create index if not exists idx_permissions_module on public.permissions(module);
create index if not exists idx_institution_users_institution_id on public.institution_users(institution_id);
create index if not exists idx_institution_users_user_id on public.institution_users(user_id);
create index if not exists idx_invitations_institution_id on public.invitations(institution_id);
create index if not exists idx_invitations_email on public.invitations(email);
create index if not exists idx_usage_metrics_institution_date on public.usage_metrics(institution_id, metric_date);

drop trigger if exists trg_institutions_set_updated_at on public.institutions;
create trigger trg_institutions_set_updated_at
before update on public.institutions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_roles_set_updated_at on public.roles;
create trigger trg_roles_set_updated_at
before update on public.roles
for each row
execute function public.set_updated_at();

drop trigger if exists trg_permissions_set_updated_at on public.permissions;
create trigger trg_permissions_set_updated_at
before update on public.permissions
for each row
execute function public.set_updated_at();

drop trigger if exists trg_institution_users_set_updated_at on public.institution_users;
create trigger trg_institution_users_set_updated_at
before update on public.institution_users
for each row
execute function public.set_updated_at();

drop trigger if exists trg_invitations_set_updated_at on public.invitations;
create trigger trg_invitations_set_updated_at
before update on public.invitations
for each row
execute function public.set_updated_at();

drop trigger if exists trg_subscriptions_set_updated_at on public.subscriptions;
create trigger trg_subscriptions_set_updated_at
before update on public.subscriptions
for each row
execute function public.set_updated_at();

insert into public.roles (code, name, scope, description)
values
  ('super_admin', 'Super Admin', 'platform', 'Platform operator with cross-tenant access'),
  ('institution_admin', 'Institution Admin', 'institution', 'Institution workspace owner and administrator'),
  ('academic_head', 'Academic Head', 'institution', 'Academic leadership role for review and oversight'),
  ('faculty', 'Faculty', 'institution', 'Faculty member who manages questions, templates, and draft papers'),
  ('reviewer_approver', 'Reviewer Approver', 'institution', 'Reviewer role for paper approval workflow')
on conflict (code) do update
set
  name = excluded.name,
  scope = excluded.scope,
  description = excluded.description,
  updated_at = timezone('utc', now());

insert into public.permissions (code, name, module, description)
values
  ('institution.manage', 'Manage Institution', 'institution', 'Update institution profile, branding, and settings'),
  ('users.invite', 'Invite Users', 'users', 'Invite institution users'),
  ('users.manage', 'Manage Users', 'users', 'Enable, disable, and update institution users'),
  ('academic_structure.manage', 'Manage Academic Structure', 'academic_structure', 'Manage campuses, departments, courses, terms, and subjects'),
  ('questions.create', 'Create Questions', 'questions', 'Create question records'),
  ('questions.edit', 'Edit Questions', 'questions', 'Edit question records'),
  ('questions.import', 'Import Questions', 'questions', 'Bulk import questions'),
  ('questions.read', 'Read Questions', 'questions', 'View question records'),
  ('templates.create', 'Create Templates', 'templates', 'Create institution templates'),
  ('templates.edit', 'Edit Templates', 'templates', 'Edit institution templates'),
  ('templates.read', 'Read Templates', 'templates', 'View institution templates'),
  ('global_templates.read', 'Read Global Templates', 'global_templates', 'View platform global templates'),
  ('papers.read', 'Read Papers', 'papers', 'View generated papers and download exports'),
  ('papers.generate', 'Generate Papers', 'papers', 'Generate papers from templates and question banks'),
  ('papers.edit_draft', 'Edit Draft Papers', 'papers', 'Edit draft papers'),
  ('papers.submit', 'Submit Papers', 'papers', 'Submit draft papers for review'),
  ('papers.review', 'Review Papers', 'papers', 'Review submitted papers'),
  ('papers.approve', 'Approve Papers', 'papers', 'Approve submitted papers'),
  ('papers.reject', 'Reject Papers', 'papers', 'Reject submitted papers'),
  ('papers.publish', 'Publish Papers', 'papers', 'Publish approved papers'),
  ('exports.generate', 'Generate Exports', 'exports', 'Create PDF and DOCX exports'),
  ('analytics.read', 'Read Analytics', 'analytics', 'View institution analytics'),
  ('audit.read', 'Read Audit Logs', 'audit', 'View audit activity')
on conflict (code) do update
set
  name = excluded.name,
  module = excluded.module,
  description = excluded.description,
  updated_at = timezone('utc', now());

with role_map as (
  select code, id
  from public.roles
),
permission_map as (
  select code, id
  from public.permissions
),
assignments as (
  select 'institution_admin'::text as role_code, unnest(array[
    'institution.manage',
    'users.invite',
    'users.manage',
    'academic_structure.manage',
    'global_templates.read',
    'questions.read',
    'templates.read',
    'papers.read',
    'papers.review',
    'papers.approve',
    'papers.reject',
    'papers.publish',
    'exports.generate',
    'analytics.read',
    'audit.read'
  ]) as permission_code
  union all
  select 'academic_head', unnest(array[
    'academic_structure.manage',
    'questions.create',
    'questions.edit',
    'questions.read',
    'templates.create',
    'templates.edit',
    'templates.read',
    'global_templates.read',
    'papers.generate',
    'papers.read',
    'papers.edit_draft',
    'papers.submit',
    'papers.review',
    'papers.approve',
    'papers.reject',
    'exports.generate',
    'analytics.read'
  ])
  union all
  select 'faculty', unnest(array[
    'questions.create',
    'questions.edit',
    'questions.import',
    'questions.read',
    'templates.create',
    'templates.edit',
    'templates.read',
    'global_templates.read',
    'papers.generate',
    'papers.read',
    'papers.edit_draft',
    'papers.submit',
    'exports.generate'
  ])
  union all
  select 'reviewer_approver', unnest(array[
    'global_templates.read',
    'questions.read',
    'templates.read',
    'papers.read',
    'papers.review',
    'papers.approve',
    'papers.reject',
    'exports.generate'
  ])
)
insert into public.role_permissions (role_id, permission_id)
select distinct rm.id, pm.id
from assignments a
join role_map rm on rm.code = a.role_code
join permission_map pm on pm.code = a.permission_code
on conflict do nothing;
