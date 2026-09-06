import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import MatchesWorkspace from "./workspace";
import type { Profile } from "@/app/types/matching";
import { isMatchingProject } from "@/lib/ai/validation";
import { createClient } from "@/utils/supabase/server";

export default async function MatchesPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=matches");

  const [{ data: profile }, { data: projects, error: projectsError }] = await Promise.all([
    supabase.from("profiles").select("display_name, skills, interests, hours_per_week").eq("id", user.id).maybeSingle(),
    supabase.from("user_projects").select(),
  ]);
  if (projectsError) throw projectsError;

  const initialProfile: Profile | null = profile?.skills?.length && profile.interests?.length && profile.hours_per_week
    ? { skills: profile.skills, interests: profile.interests, hoursPerWeek: Number(profile.hours_per_week) }
    : null;
  const matchingProjects = (projects ?? []).map((project) => ({
    id: project.proj_id == null ? "" : String(project.proj_id),
    title: project.title?.trim() || "Untitled project",
    description: project.description ?? "",
    skillsNeeded: project.lookingFor ?? project.looking_for ?? [],
    hoursPerWeek: Number(project.hours_per_week),
  })).filter(isMatchingProject);
  const accountLabel = profile?.display_name?.trim() || user.email || "Account";

  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={accountLabel} />
      <section className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <p className="text-sm font-semibold text-indigo-600">Personalized recommendations</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Find your matches</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Set the skills, interests, and time you can offer. We’ll compare them with active projects and suggest strong fits.</p>
        <MatchesWorkspace initialProfile={initialProfile} projects={matchingProjects} userId={user.id} />
      </section>
    </main>
  );
}
