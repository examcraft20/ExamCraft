-- Migration: Create get_random_questions RPC for Paper Generation Engine
create or replace function public.get_random_questions(
  p_institution_id uuid,
  p_limit integer,
  p_difficulties text[] default '{}',
  p_bloom_levels text[] default '{}',
  p_unit_numbers integer[] default '{}',
  p_department_id uuid default null,
  p_course_id uuid default null,
  p_subject_id uuid default null
) 
returns setof public.institution_questions
language plpgsql
security definer
as $$
begin
  return query
  select *
  from public.institution_questions q
  where q.institution_id = p_institution_id
    and q.status = 'ready'
    and (p_department_id is null or q.department_id = p_department_id)
    and (p_course_id is null or q.course_id = p_course_id)
    and (p_subject_id is null or q.subject_id = p_subject_id)
    and (array_length(p_difficulties, 1) is null or q.difficulty = any(p_difficulties))
    and (array_length(p_bloom_levels, 1) is null or q.bloom_level = any(p_bloom_levels))
    and (array_length(p_unit_numbers, 1) is null or q.unit_number = any(p_unit_numbers))
  order by random()
  limit p_limit;
end;
$$;

-- Grant execution to authenticated users
grant execute on function public.get_random_questions to authenticated;
