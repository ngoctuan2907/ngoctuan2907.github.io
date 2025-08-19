-- A. Do these tables exist?
select
  to_regclass('public.stakeholders')  as stakeholders,
  to_regclass('public.memberships')   as memberships,
  to_regclass('public.subscriptions') as subscriptions,
  to_regclass('public.user_profiles') as user_profiles;

-- B. Which policies exist on user_profiles?
select policyname, cmd, roles, permissive
from pg_policies
where schemaname = 'public' and tablename = 'user_profiles'
order by policyname;

-- C. Which policies exist on stakeholders?
select policyname, cmd, roles, permissive
from pg_policies
where schemaname = 'public' and tablename = 'stakeholders'
order by policyname;