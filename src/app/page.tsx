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

  return (
    <App
      projects={(projects ?? []) as Project[]}
      accountLabel={accountLabel}
    />
  );
}
