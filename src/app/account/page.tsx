import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import AccountProfile from "./profile";
import { createClient } from "@/utils/supabase/server";

export default async function AccountPage() {
  const supabase = createClient(await cookies());
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, disciplines, skills, interests, hours_per_week")
    .eq("id", user.id)
    .maybeSingle();

  return <AccountProfile email={user.email ?? ""} userId={user.id} initialProfile={profile} />;
}
