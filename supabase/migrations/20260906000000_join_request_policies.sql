alter table public.join_requests enable row level security;

drop policy if exists "Authenticated users can request to join" on public.join_requests;
drop policy if exists "Users can create join requests" on public.join_requests;
drop policy if exists "Requesters and project owners can view join requests" on public.join_requests;
drop policy if exists "Project owners can update join requests" on public.join_requests;

create policy "Authenticated users can request to join"
on public.join_requests
for insert
to authenticated
with check (
  auth.uid() is not null
  and requester_id::text = (select auth.uid())::text
);

create policy "Requesters and project owners can view join requests"
on public.join_requests
for select
to authenticated
using (
  (select auth.uid())::text = requester_id::text
  or exists (
    select 1
    from public.user_projects
    where public.user_projects.proj_id = project_id
      and public.user_projects.owner::text = (select auth.uid())::text
  )
);

create policy "Project owners can update join requests"
on public.join_requests
for update
to authenticated
using (
  exists (
    select 1
    from public.user_projects
    where public.user_projects.proj_id = project_id
      and public.user_projects.owner::text = (select auth.uid())::text
  )
)
with check (
  exists (
    select 1
    from public.user_projects
    where public.user_projects.proj_id = project_id
      and public.user_projects.owner::text = (select auth.uid())::text
  )
);
