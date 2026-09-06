import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import JoinRequestActions from "@/components/JoinRequestActions";
import ProjectCard, { type Project } from "@/components/ProjectCard";
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
  owner_name?: string | null;
  created_at?: string | null;
  project_url?: string | null;
  member_ids?: string[] | null;
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
  attachment_path?: string | null;
  attachment_name?: string | null;
  attachment_type?: string | null;
  attachment_size?: number | null;
  attachment_url?: string | null;
  status: "pending" | "approved" | "rejected";
};

function projectName(project: ProjectRecord) {
  return project.title?.trim() || "Untitled project";
}

function toProjectCard(project: ProjectRecord): Project {
  return {
    id: String(project.proj_id),
    title: projectName(project),
    description: project.description ?? "No project description provided.",
    tags: project.tags ?? [],
    owner: project.owner ?? "",
    owner_name: project.owner_name ?? null,
    project_url: project.project_url ?? null,
    lookingFor: project.lookingFor ?? project.looking_for ?? [],
    hours_per_week: Number(project.hours_per_week) || 0,
    num_members: Number(project.num_members) || 1,
    created_at: project.created_at ?? new Date(0).toISOString(),
  };
}

function statusStyles(status: JoinRequestRecord["status"]) {
  return (
    status === "approved" ? "bg-emerald-50 text-emerald-700"
    : status === "rejected" ? "bg-rose-50 text-rose-700"
    : "bg-amber-50 text-amber-700"
  );
}

export default async function DashboardPage() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=dashboard");

  const [
    { data: profile },
    { data: allProjects, error: projectsError },
    { data: outgoingRequests, error: outgoingError },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase.from("user_projects").select(),
    supabase
      .from("join_requests")
      .select()
      .eq("requester_id", user.id)
      .in("status", ["pending", "approved"]),
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
    incomingRequests = await Promise.all(
      incomingRequests.map(async (request) => {
        if (!request.attachment_path) return request;
        const { data: signedAttachment, error: signedAttachmentError } = await supabase.storage
          .from("join-request-attachments")
          .createSignedUrl(request.attachment_path, 60 * 60);
        if (signedAttachmentError) throw signedAttachmentError;
        return { ...request, attachment_url: signedAttachment.signedUrl };
      }),
    );
  }

  const ownerIds = Array.from(
    new Set(projects.map((project) => project.owner).filter(Boolean)),
  );
  let ownerNames: { id: string; username: string | null }[] = [];
  if (ownerIds.length > 0) {
    const { data, error } = await supabase
      .from("project_owner_names")
      .select("id, username")
      .in("id", ownerIds);
    if (!error) ownerNames = data ?? [];
  }
  const ownerNameById = new Map(
    ownerNames.map((owner) => [owner.id, owner.username]),
  );
  const projectById = new Map<string, ProjectRecord>(
    projects.map((project) => [
      String(project.proj_id),
      {
        ...project,
        owner_name: ownerNameById.get(String(project.owner)) ?? null,
      },
    ]),
  );
  const joinedProjects = requests
    .filter((request) => request.status === "approved")
    .map((request) => projectById.get(String(request.project_id)))
    .filter((project): project is ProjectRecord => Boolean(project));
  const activeProjects = Array.from(
    new Map(
      [...ownedProjects, ...joinedProjects].map((project) => [
        String(project.proj_id),
        projectById.get(String(project.proj_id)) ?? project,
      ]),
    ).values(),
  );
  const pendingRequests = requests.filter(
    (request) => request.status === "pending",
  );
  const pendingIncomingRequests = incomingRequests.filter(
    (request) => request.status === "pending",
  );
  const accountLabel = profile?.display_name?.trim() || user.email || "Account";

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#f8f8fc] text-slate-900"
    >
      <SiteHeader accountLabel={accountLabel} />
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-2xl">
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
            Dashboard
          </h1>
          <p className="mt-3 text-slate-600">
            Keep track of your active collaborations and the join requests
            waiting for a decision.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          <DashboardSection
            eyebrow=""
            title="Active projects"
            emptyMessage="Create a project or get accepted to one to see it here."
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          >
            {activeProjects.map((project) => (
              <ProjectCard
                key={project.proj_id}
                project={toProjectCard(project)}
                showProjectLink={false}
              />
            ))}
          </DashboardSection>

          <div className="grid gap-8 lg:grid-cols-2">
            <DashboardSection
              eyebrow=""
              title="Waiting for approval"
              emptyMessage="You do not have any pending join requests."
            >
              {pendingRequests.map((request) => {
                const project = projectById.get(String(request.project_id));
                return (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-bold text-slate-950">
                        {project ? projectName(project) : "Project unavailable"}
                      </h3>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles(request.status)}`}
                      >
                        Pending
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      Your request is with the project owner for review.
                    </p>
                    <p className="mt-3 text-sm text-slate-600">
                      Owner:{" "}
                      <span className="font-semibold text-slate-700">
                        {project?.owner === user.id ?
                          "You"
                        : project?.owner_name || "Project owner"}
                      </span>
                    </p>
                    <p className="mt-4 text-xs text-slate-500">
                      {request.hours_per_week ?? "—"} hrs/week ·{" "}
                      {request.meeting_modality ?? "Modality not specified"}
                    </p>
                  </article>
                );
              })}
            </DashboardSection>

            <DashboardSection
              eyebrow=""
              title="People asking to join"
              emptyMessage="No one has requested to join your projects yet."
            >
              {pendingIncomingRequests.map((request) => {
                const project = projectById.get(String(request.project_id));
                return (
                  <article
                    key={request.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-950">
                          {request.applicant_name?.trim() || "A collaborator"}
                        </h3>
                        <p className="mt-1 text-xs text-slate-500">
                          Wants to join{" "}
                          {project ? projectName(project) : "your project"}
                        </p>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyles(request.status)}`}
                      >
                        Pending
                      </span>
                    </div>
                    {request.motivation && (
                      <p className="mt-4 text-sm leading-6 text-slate-600">
                        {request.motivation}
                      </p>
                    )}
                    {request.contribution && (
                      <p className="mt-3 text-sm text-slate-700">
                        <span className="font-semibold">Can help with:</span>{" "}
                        {request.contribution}
                      </p>
                    )}
                    <p className="mt-4 text-xs text-slate-500">
                      {request.hours_per_week ?? "—"} hrs/week ·{" "}
                      {request.meeting_modality ?? "Modality not specified"}
                    </p>
                    {request.attachment_url && (
                      <a href={request.attachment_url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100">
                        View attachment: {request.attachment_name || "Open file"}
                        <span aria-hidden="true">↗</span>
                      </a>
                    )}
                    <JoinRequestActions projectId={Number(request.project_id)} requestId={String(request.id)} />
                  </article>
                );
              })}
            </DashboardSection>
          </div>
        </div>
      </section>
    </main>
  );
}

function DashboardSection({
  eyebrow,
  title,
  emptyMessage,
  className = "",
  children,
}: {
  eyebrow: string;
  title: string;
  emptyMessage: string;
  className?: string;
  children: React.ReactNode;
}) {
  const hasItems =
    Array.isArray(children) ? children.length > 0 : Boolean(children);

  return (
    <section
      aria-labelledby={`${title.replaceAll(" ", "-").toLowerCase()}-heading`}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">
        {eyebrow}
      </p>
      <h2
        id={`${title.replaceAll(" ", "-").toLowerCase()}-heading`}
        className="mt-2 text-2xl font-bold tracking-tight text-slate-950"
      >
        {title}
      </h2>
      <div className={`mt-5 gap-4 ${className || "space-y-4"}`}>
        {hasItems ?
          children
        : <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-sm text-slate-500">
            {emptyMessage}
          </div>
        }
      </div>
    </section>
  );
}
