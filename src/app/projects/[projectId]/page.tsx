import Link from "next/link";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import ProjectJoinAction from "@/components/ProjectJoinAction";
import ProjectMembers from "@/components/ProjectMembers";
import type { Project } from "@/components/ProjectCard";
import { createClient } from "@/utils/supabase/server";

function safeProjectUrl(value: unknown) {
  if (typeof value !== "string" || !value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:" ?
        url.toString()
      : null;
  } catch {
    return null;
  }
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: projectRow, error } = await supabase
    .from("user_projects")
    .select()
    .eq("proj_id", projectId)
    .maybeSingle();

  if (error) throw error;
  if (!projectRow) notFound();

  const memberIds = Array.from(
    new Set([
      ...(Array.isArray(projectRow.member_ids) ? projectRow.member_ids : []),
      projectRow.owner,
    ].filter((id): id is string => typeof id === "string" && Boolean(id))),
  );

  const [
    { data: memberProfiles },
    { data: viewerProfile },
    { data: existingRequest },
  ] = await Promise.all([
    memberIds.length ?
      supabase
        .from("project_owner_names")
        .select("id, username")
        .in("id", memberIds)
    : Promise.resolve({ data: null }),
    user ?
      supabase
        .from("profiles")
        .select("display_name")
        .eq("id", user.id)
        .maybeSingle()
    : Promise.resolve({ data: null }),
    user && projectRow.owner !== user.id ?
      supabase
        .from("join_requests")
        .select("id")
        .eq("project_id", projectId)
        .eq("requester_id", user.id)
        .maybeSingle()
    : Promise.resolve({ data: null }),
  ]);
  const memberNameById = new Map(
    (memberProfiles ?? []).map((profile) => [profile.id, profile.username]),
  );
  const members = memberIds.map((id) => ({
    id,
    name: memberNameById.get(id) ?? "Team member",
    isOwner: id === projectRow.owner,
  }));

  const project: Project = {
    id: String(projectRow.proj_id),
    title: projectRow.title?.trim() || "Untitled project",
    description: projectRow.description ?? "No description provided.",
    tags: Array.isArray(projectRow.tags) ? projectRow.tags : [],
    owner: projectRow.owner,
    owner_name: memberNameById.get(projectRow.owner) ?? null,
    project_url:
      typeof projectRow.project_url === "string" ?
        projectRow.project_url
      : null,
    lookingFor:
      Array.isArray(projectRow.lookingFor) ? projectRow.lookingFor
      : Array.isArray(projectRow.looking_for) ? projectRow.looking_for
      : [],
    hours_per_week: Number(projectRow.hours_per_week) || 0,
    num_members: Number(projectRow.num_members) || 1,
    created_at: projectRow.created_at ?? new Date(0).toISOString(),
  };
  const projectUrl = safeProjectUrl(project.project_url);
  const accountLabel =
    viewerProfile?.display_name?.trim() || user?.email || null;

  return (
    <main
      id="main-content"
      className="min-h-screen bg-[#f8f8fc] text-slate-900"
    >
      <SiteHeader accountLabel={accountLabel} />
      <section className="mx-auto max-w-5xl px-5 py-10 sm:px-8 sm:py-14">
        <Link
          href="/#projects"
          className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus:outline-none focus:underline"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="size-4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m15 18-6-6 6-6" />
          </svg>
          Back to Explore
        </Link>
        <article className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-gradient-to-br from-indigo-50 via-white to-white px-6 py-8 sm:px-9 sm:py-10">
            <div className="flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700"
                >
                  {tag}
                </span>
              ))}
            </div>
            <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
              {project.title}
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600">
              {project.description}
            </p>
            <p className="mt-4 text-sm text-slate-500">
              Posted {new Date(project.created_at).toLocaleDateString()}
            </p>
            {projectUrl && (
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus:outline-none focus:underline"
              >
                Visit project link
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="size-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 17 17 7M9 7h8v8" />
                </svg>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </div>
          <div className="grid gap-8 px-6 py-8 sm:px-9 lg:grid-cols-[1fr_auto]">
            <div>
              <h2 className="text-lg font-bold text-slate-950">
                What the team needs
              </h2>
              {project.lookingFor.length ?
                <div className="mt-4 flex flex-wrap gap-2">
                  {project.lookingFor.map((role) => (
                    <span
                      key={role}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              : <p className="mt-3 text-sm text-slate-600">
                  Open to collaborators with a range of skills.
                </p>
              }
              <div className="mt-8 border-t border-slate-100 pt-6">
                <h2 className="text-lg font-bold text-slate-950">
                  Team members
                </h2>
                <ProjectMembers
                  projectId={project.id}
                  members={members}
                  canRemoveMembers={project.owner === user?.id}
                />
              </div>
            </div>
            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-5 lg:w-64">
              <dl className="grid gap-5 text-sm">
                <div>
                  <dt className="text-slate-500">Time commitment</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">
                    {project.hours_per_week} hrs/week
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Current team</dt>
                  <dd className="mt-1 text-xl font-bold text-slate-950">
                    {project.num_members} members
                  </dd>
                </div>
              </dl>
              <div className="mt-6 border-t border-slate-200 pt-5">
                <ProjectJoinAction
                  project={project}
                  accountName={accountLabel}
                  isOwner={project.owner === user?.id}
                  hasRequested={Boolean(existingRequest)}
                />
              </div>
            </aside>
          </div>
        </article>
      </section>
    </main>
  );
}
