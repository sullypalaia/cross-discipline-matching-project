alter table public.join_requests
  add column if not exists attachment_path text,
  add column if not exists attachment_name text,
  add column if not exists attachment_type text,
  add column if not exists attachment_size bigint;

insert into storage.buckets (id, name, public)
values ('join-request-attachments', 'join-request-attachments', false)
on conflict (id) do nothing;

drop policy if exists "Users can upload join request attachments" on storage.objects;
create policy "Users can upload join request attachments"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'join-request-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);

drop policy if exists "Request participants can view attachments" on storage.objects;
create policy "Request participants can view attachments"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'join-request-attachments'
  and exists (
    select 1
    from public.join_requests
    left join public.user_projects
      on public.user_projects.proj_id = public.join_requests.project_id
    where public.join_requests.attachment_path = storage.objects.name
      and (
        public.join_requests.requester_id = (select auth.uid())
        or public.user_projects.owner::text = (select auth.uid())::text
      )
  )
);

drop policy if exists "Users can delete their join request attachments" on storage.objects;
create policy "Users can delete their join request attachments"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'join-request-attachments'
  and (storage.foldername(name))[1] = (select auth.uid())::text
);
