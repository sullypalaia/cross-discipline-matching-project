drop policy if exists "Project owners can update their projects" on public.user_projects;

create policy "Project owners can update their projects"
on public.user_projects
for update
to authenticated
using (owner::text = (select auth.uid())::text)
with check (owner::text = (select auth.uid())::text);
