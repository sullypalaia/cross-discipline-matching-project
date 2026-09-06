import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/utils/supabase/server";

type ProjectRow = {
  id?: string;
  proj_id?: string;
  title?: string;
  description?: string;
  tags?: string[];
  owner: string;
  lookingFor?: string[];
  looking_for?: string[];
  hours_per_week?: number;
  num_members?: number;
};

export default async function MyProjectsPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [
    { data: profile },
    { data: allProjects, error: projectsError },
    { data: requests },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_projects").select(),
    supabase
      .from("join_requests")
      .select("project_id")
      .eq("requester_id", user.id)
      .eq("status", "accepted"),
  ]);
  if (projectsError) throw projectsError;

  const acceptedIds = new Set(
    (requests ?? []).map((request) => String(request.project_id)),
  );
  const projects = ((allProjects ?? []) as ProjectRow[])
    .map((project) => ({
      ...project,
      projectId: String(project.id ?? project.proj_id ?? ""),
    }))
    .filter(
      (project) =>
        project.owner === user.id || acceptedIds.has(project.projectId),
    );
  const accountLabel = profile?.display_name?.trim() || user.email || "Account";

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#f8f8fc] text-slate-900"
    >
      <SiteHeader accountLabel={accountLabel} />
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          My projects
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          Projects you created and projects where your request to join has been
          accepted.
        </p>
        {projects.length ?
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {projects.map((project) => {
              const owner = project.owner === user.id;
              return (
                <article
                  key={project.projectId}
                  className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${owner ? "bg-indigo-50 text-indigo-700" : "bg-emerald-50 text-emerald-700"}`}
                    >
                      {owner ? "Owner" : "Collaborator"}
                    </span>
                    <span className="text-sm text-slate-500">
                      {project.num_members ?? 1} members
                    </span>
                  </div>
                  <h2 className="mt-5 text-xl font-bold tracking-tight text-slate-950">
                    {project.title ?? "Untitled project"}
                  </h2>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                    {project.description ?? "No description yet."}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {(project.tags ?? []).map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <p className="mt-5 text-sm text-slate-600">
                    {project.hours_per_week ?? 0} hrs/week ·{" "}
                    {(project.lookingFor ?? project.looking_for ?? []).join(
                      " · ",
                    ) || "Open to collaboration"}
                  </p>
                  <Link
                    href={`/projects/${encodeURIComponent(project.projectId)}`}
                    className="mt-5 inline-flex text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus:outline-none focus:underline"
                  >
                    View project →
                  </Link>
                </article>
              );
            })}
          </div>
        : <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <p className="text-lg font-semibold text-slate-900">
              You are not part of any projects yet.
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Create a project or send a request to join one from Explore.
            </p>
          </div>
        }
      </section>
    </main>
  );
}
