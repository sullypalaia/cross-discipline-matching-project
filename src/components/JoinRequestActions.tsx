"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/clients";

export default function JoinRequestActions({ projectId, requestId }: { projectId: number | string; requestId: number | string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setBusy(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error("You must be signed in to accept requests.");

      const [{ data: project, error: projectError }, { data: joinRequest, error: requestError }] = await Promise.all([
        supabase.from("user_projects").select("owner, member_ids, num_members").eq("proj_id", projectId).maybeSingle(),
        supabase.from("join_requests").select("requester_id, status").eq("id", requestId).eq("project_id", projectId).maybeSingle(),
      ]);
      if (projectError || !project) throw new Error(projectError?.message ?? "This project no longer exists.");
      if (project.owner !== user.id) throw new Error("Only the project owner can accept requests.");
      if (requestError || !joinRequest) throw new Error(requestError?.message ?? "This join request no longer exists.");
      if (joinRequest.status !== "pending") throw new Error("This join request has already been resolved.");

      const memberIds = Array.isArray(project.member_ids) ? project.member_ids : [];
      const alreadyMember = memberIds.includes(joinRequest.requester_id);
      const nextMemberIds = alreadyMember ? memberIds : [...memberIds, joinRequest.requester_id];
      const nextMemberCount = alreadyMember ? (project.num_members ?? nextMemberIds.length) : (project.num_members ?? memberIds.length) + 1;

      const { error: projectUpdateError } = await supabase
        .from("user_projects")
        .update({ member_ids: nextMemberIds, num_members: nextMemberCount })
        .eq("proj_id", projectId)
        .eq("owner", user.id);
      if (projectUpdateError) throw new Error(projectUpdateError.message);
      const { error: requestUpdateError } = await supabase
        .from("join_requests")
        .update({ status: "approved" })
        .eq("id", requestId)
        .eq("project_id", projectId)
        .eq("status", "pending");
      if (requestUpdateError) throw new Error(requestUpdateError.message);
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to accept this request.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mt-4"><button type="button" onClick={accept} disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Accepting…" : "Accept"}</button>{error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}</div>;
}
