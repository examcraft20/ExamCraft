insert into public.permissions (code, name, module, description)
values
  ('questions.read', 'Read Questions', 'questions', 'View institution questions'),
  ('questions.review', 'Review Questions', 'questions', 'Review and comment on questions'),
  ('questions.approve', 'Approve Questions', 'questions', 'Approve questions to ready'),
  ('questions.reject', 'Reject Questions', 'questions', 'Return questions to draft'),
  ('templates.read', 'Read Templates', 'templates', 'View institution templates'),
  ('templates.review', 'Review Templates', 'templates', 'Review and comment on templates'),
  ('templates.approve', 'Approve Templates', 'templates', 'Publish templates'),
  ('templates.reject', 'Reject Templates', 'templates', 'Return templates to draft')
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
    'questions.read',
    'questions.review',
    'questions.approve',
    'questions.reject',
    'templates.read',
    'templates.review',
    'templates.approve',
    'templates.reject'
  ]) as permission_code
  union all
  select 'academic_head', unnest(array[
    'questions.read',
    'questions.review',
    'questions.approve',
    'questions.reject',
    'templates.read',
    'templates.review',
    'templates.approve',
    'templates.reject'
  ])
  union all
  select 'reviewer_approver', unnest(array[
    'questions.read',
    'questions.review',
    'questions.approve',
    'questions.reject',
    'templates.read',
    'templates.review',
    'templates.approve',
    'templates.reject'
  ])
  union all
  select 'faculty', unnest(array[
    'questions.read',
    'templates.read'
  ])
)
insert into public.role_permissions (role_id, permission_id)
select distinct rm.id, pm.id
from assignments a
join role_map rm on rm.code = a.role_code
join permission_map pm on pm.code = a.permission_code
on conflict do nothing;

drop policy if exists questions_update_by_permission on public.institution_questions;
create policy questions_update_by_permission
on public.institution_questions
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'questions.edit')
  or public.current_user_has_permission(institution_id, 'questions.review')
  or public.current_user_has_permission(institution_id, 'questions.approve')
  or public.current_user_has_permission(institution_id, 'questions.reject')
)
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'questions.edit')
  or public.current_user_has_permission(institution_id, 'questions.review')
  or public.current_user_has_permission(institution_id, 'questions.approve')
  or public.current_user_has_permission(institution_id, 'questions.reject')
);

drop policy if exists templates_update_by_permission on public.institution_templates;
create policy templates_update_by_permission
on public.institution_templates
for update
to authenticated
using (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'templates.edit')
  or public.current_user_has_permission(institution_id, 'templates.review')
  or public.current_user_has_permission(institution_id, 'templates.approve')
  or public.current_user_has_permission(institution_id, 'templates.reject')
)
with check (
  public.jwt_is_super_admin()
  or public.current_user_has_permission(institution_id, 'templates.edit')
  or public.current_user_has_permission(institution_id, 'templates.review')
  or public.current_user_has_permission(institution_id, 'templates.approve')
  or public.current_user_has_permission(institution_id, 'templates.reject')
);
