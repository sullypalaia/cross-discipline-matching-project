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

  return <App projects={(projects ?? []) as Project[]} />;
}
