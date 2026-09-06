alter table public.user_projects
  add column if not exists project_url text;

comment on column public.user_projects.project_url is
  'Optional public http(s) URL for the project website, repository, or prototype.';
