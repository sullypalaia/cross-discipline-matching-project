import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/utils/supabase/server";

type ProjectRecord = {
  proj_id: number | string;
  title?: string | null;
  description?: string | null;
  tags?: string[] | null;
  lookingFor?: string[] | null;
  looking_for?: string[] | null;
  hours_per_week?: number | null;
  num_members?: number | null;
  owner?: string | null;
};

type JoinRequestRecord = {
  id: string | number;
  project_id: number | string;
  requester_id: string;
  applicant_name?: string | null;
  motivation?: string | null;
  contribution?: string | null;
  hours_per_week?: number | null;
  meeting_modality?: string | null;
  status: "pending" | "approved" | "rejected";
};

function projectName(project: ProjectRecord) {
  return project.title?.trim() || "Untitled project";
}

function statusStyles(status: JoinRequestRecord["status"]) {
  return status === "approved"
    ? "bg-emerald-50 text-emerald-700"
    : status === "rejected"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
}

export default async function DashboardPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=dashboard");

  const [{ data: profile }, { data: allProjects, error: projectsError }, { data: outgoingRequests, error: outgoingError }] =
    await Promise.all([
      supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
      supabase.from("user_projects").select(),
      supabase.from("join_requests").select().eq("requester_id", user.id).in("status", ["pending", "approved"]),
    ]);

  if (projectsError) throw projectsError;
  if (outgoingError) throw outgoingError;

  const projects = (allProjects ?? []) as ProjectRecord[];
  const requests = (outgoingRequests ?? []) as JoinRequestRecord[];
  const ownedProjects = projects.filter((project) => project.owner === user.id);
  const ownedProjectIds = ownedProjects.map((project) => project.proj_id);

  let incomingRequests: JoinRequestRecord[] = [];
  if (ownedProjectIds.length > 0) {
    const { data, error } = await supabase
      .from("join_requests")
      .select()
      .in("project_id", ownedProjectIds);
    if (error) throw error;
    incomingRequests = (data ?? []) as JoinRequestRecord[];
  }

  const projectById = new Map(projects.map((project) => [String(project.proj_id), project]));
  const joinedProjects = requests
    .filter((request) => request.status === "approved")
    .map((request) => projectById.get(String(request.project_id)))
    .filter((project): project is ProjectRecord => Boolean(project));
  const pendingRequests = requests.filter((request) => request.status === "pending");
  const accountLabel = profile?.display_name?.trim() || user.email || "Account";

  return (
    <main id="main-content" className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={accountLabel} />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Your Crosspaths activity
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-3 text-slate-600">
            Keep track of collaborators, projects you have joined, and requests
            still waiting for an answer.
          </p>
        </div>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">
          <DashboardSection
            eyebrow="For your projects"
            title="Join requests"
            emptyMessage="No one has requested to join your projects yet."
          >
            {incomingRequests.map((request) => {
              const project = projectById.get(String(request.project_id));
              return (
                <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-slate-950">
                        {request.applicant_name?.trim() || "A collaborator"}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        Wants to join {project ? projectName(project) : "your project"}
                      </p>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  {request.motivation && <p className="mt-4 text-sm leading-6 text-slate-600">{request.motivation}</p>}
                  {request.contribution && (
                    <p className="mt-3 text-sm text-slate-700">
                      <span className="font-semibold">Can help with:</span> {request.contribution}
                    </p>
                  )}
                  <p className="mt-4 text-xs text-slate-500">
                    {request.hours_per_week ?? "—"} hrs/week · {request.meeting_modality ?? "Modality not specified"}
                  </p>
                </article>
              );
            })}
          </DashboardSection>

          <DashboardSection
            eyebrow="Accepted"
            title="Projects you joined"
            emptyMessage="Accepted projects will appear here."
          >
            {joinedProjects.map((project) => (
              <article key={project.proj_id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-bold text-slate-950">{projectName(project)}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
                  {project.description || "No project description provided."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(project.tags ?? []).map((tag) => (
                    <span key={tag} className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {tag}
                    </span>
                  ))}
                </div>
              </article>
            ))}
          </DashboardSection>

          <DashboardSection
            eyebrow="Awaiting a response"
            title="Pending requests"
            emptyMessage="You do not have any pending join requests."
          >
            {pendingRequests.map((request) => {
              const project = projectById.get(String(request.project_id));
              return (
                <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-slate-950">
                      {project ? projectName(project) : "Project unavailable"}
                    </h3>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusStyles(request.status)}`}>
                      Pending
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    Your request is with the project owner for review.
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    {request.hours_per_week ?? "—"} hrs/week · {request.meeting_modality ?? "Modality not specified"}
                  </p>
                </article>
              );
            })}
          </DashboardSection>
        </div>
      </section>
    </main>
  );
}

function DashboardSection({
  eyebrow,
  title,
  emptyMessage,
  children,
}: {
  eyebrow: string;
  title: string;
  emptyMessage: string;
  children: React.ReactNode;
}) {
  const hasItems = Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <section aria-labelledby={`${title.replaceAll(" ", "-").toLowerCase()}-heading`}>
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">{eyebrow}</p>
      <h2 id={`${title.replaceAll(" ", "-").toLowerCase()}-heading`} className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {title}
      </h2>
      <div className="mt-5 space-y-4">
        {hasItems ? children : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-sm text-slate-500">
            {emptyMessage}
          </div>
        )}
      </div>
    </section>
  );
}
