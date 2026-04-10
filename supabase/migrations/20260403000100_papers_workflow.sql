create table if not exists public.institution_papers (
  id uuid primary key default gen_random_uuid(),
  institution_id uuid not null references public.institutions(id) on delete cascade,
  created_by_user_id uuid not null references auth.users(id) on delete cascade,
  template_id uuid references public.institution_templates(id) on delete set null,
  title text not null,
  status text not null default 'draft',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  submitted_at timestamptz,
  reviewed_at timestamptz,
  approved_at timestamptz,
  published_at timestamptz,
  constraint institution_papers_status_check check (status in ('draft', 'submitted', 'in_review', 'approved', 'rejected', 'published', 'archived'))
);

create index if not exists idx_institution_papers_institution_id
  on public.institution_papers(institution_id, status, created_at desc);

drop trigger if exists trg_institution_papers_set_updated_at on public.institution_papers;
create trigger trg_institution_papers_set_updated_at
before update on public.institution_papers
for each row
execute function public.set_updated_at();

alter table public.institution_papers enable row level security;

drop policy if exists papers_select_by_membership on public.institution_papers;
create policy papers_select_by_membership
on public.institution_papers
for select
to authenticated
using (
  public.jwt_is_super_admin()
  or institution_id in (select public.current_user_institution_ids())
);

drop policy if exists papers_insert_by_permission on public.institution_papers;
create policy papers_insert_by_permission
on public.institution_papers
for insert
to authenticated
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'papers.generate')
);

drop policy if exists papers_update_by_permission on public.institution_papers;
create policy papers_update_by_permission
on public.institution_papers
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'papers.edit_draft')
  or public.current_user_has_permission(institution_id, 'papers.submit')
  or public.current_user_has_permission(institution_id, 'papers.review')
  or public.current_user_has_permission(institution_id, 'papers.approve')
  or public.current_user_has_permission(institution_id, 'papers.reject')
  or public.current_user_has_permission(institution_id, 'papers.publish')
);
