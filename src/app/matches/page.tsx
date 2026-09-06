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
    <main id="main-content" className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={accountLabel} />
      <div className="relative min-h-64 overflow-hidden bg-slate-950 text-white sm:min-h-80">
        <img src="https://www.calpoly.edu/sites/default/files/2022-12/20220422-DesignVillage-JoeJ0055.jpg" alt="Cal Poly students collaborating outdoors" className="absolute inset-0 size-full object-cover object-center" />
        <div className="absolute inset-0 bg-slate-950/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex min-h-64 max-w-7xl flex-col justify-center px-5 py-8 sm:min-h-80 sm:px-8"><p className="text-sm font-semibold text-indigo-200">Personalized recommendations</p><h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">Find your matches</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">Set the skills, interests, and time you can offer. We’ll compare them with active projects and suggest strong fits.</p></div>
      </div>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14"><div className="max-w-3xl"><MatchesWorkspace initialProfile={initialProfile} projects={matchingProjects} userId={user.id} displayName={accountLabel} /></div></section>
    </main>
  );
}
