-- Expose only a collaborator name for project cards. Other profile fields
-- continue to be protected by the owner-only policies on public.profiles.
create or replace view public.project_owner_names as
select
  id,
  nullif(trim(display_name), '') as username
from public.profiles;

revoke all on public.project_owner_names from anon, authenticated;
grant select on public.project_owner_names to anon, authenticated;
