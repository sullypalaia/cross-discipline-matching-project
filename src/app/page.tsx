import App from "../App";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import type { Project } from "../components/ProjectCard";

export default async function Home() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data: projects, error } = await supabase
    .from("user_projects")
    .select();

  if (error) {
    console.log(error);
    throw error;
  }

  const { data: { user } } = await supabase.auth.getUser();
  let accountLabel: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    accountLabel = profile?.display_name?.trim() || user.email || "Account";
  }
     
  const ownerIds = Array.from(
    new Set((projects ?? []).map((project) => project.owner).filter(Boolean)),
  );
  let usernames: { id: string; username: string | null }[] = [];

  if (ownerIds.length > 0) {
    const { data, error: ownerError } = await supabase
      .from("project_owner_names")
      .select("id, username")
      .in("id", ownerIds);

    // The project feed must remain usable while the owner-name migration is
    // being deployed. Once the view exists, names populate automatically.
    if (!ownerError) usernames = data ?? [];
  }

  const usernameById = new Map(
    usernames.map((profile) => [profile.id, profile.username]),
  );
  const projectsWithOwners = (projects ?? []).map((project) => ({
    ...project,
    owner_name: usernameById.get(project.owner) ?? null,
  }));
  
  return (
    <App
      projects={(projectsWithOwners ?? []) as Project[]}
      accountLabel={accountLabel}
    />
  );
}
