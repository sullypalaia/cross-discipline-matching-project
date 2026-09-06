import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: NextRequest, context: { params: Promise<{ projectId: string; requestId: string }> }) {
  const { projectId, requestId } = await context.params;
  const body = await request.json().catch(() => null);
  if (body?.status !== "accepted") return Response.json({ error: "Only accepting requests is supported here." }, { status: 400 });

  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "You must be signed in." }, { status: 401 });

  const { data: project, error: projectError } = await supabase
    .from("user_projects")
    .select("owner, member_ids, num_members")
    .eq("proj_id", projectId)
    .maybeSingle();
  if (projectError) return Response.json({ error: "Unable to load the project." }, { status: 500 });
  if (!project) return Response.json({ error: "This project no longer exists." }, { status: 404 });
  if (project.owner !== user.id) return Response.json({ error: "Only the project owner can accept requests." }, { status: 403 });

  const { data: joinRequest, error: requestError } = await supabase
    .from("join_requests")
    .select("id, requester_id, status")
    .eq("id", requestId)
    .eq("project_id", projectId)
    .maybeSingle();
  if (requestError) return Response.json({ error: "Unable to load this join request." }, { status: 500 });
  if (!joinRequest) return Response.json({ error: "This join request no longer exists." }, { status: 404 });
  if (joinRequest.status !== "pending") return Response.json({ error: "This join request has already been resolved." }, { status: 409 });

  const memberIds = Array.isArray(project.member_ids) ? project.member_ids : [];
  const alreadyMember = memberIds.includes(joinRequest.requester_id);
  const nextMemberIds = alreadyMember ? memberIds : [...memberIds, joinRequest.requester_id];
  const nextMemberCount = alreadyMember ? (project.num_members ?? nextMemberIds.length) : (project.num_members ?? memberIds.length) + 1;

  const { error: projectUpdateError } = await supabase
    .from("user_projects")
    .update({ member_ids: nextMemberIds, num_members: nextMemberCount })
    .eq("proj_id", projectId)
    .eq("owner", user.id);
  if (projectUpdateError) return Response.json({ error: "Unable to add this member to the project." }, { status: 500 });

  const { error: requestUpdateError } = await supabase
    .from("join_requests")
    .update({ status: "accepted" })
    .eq("id", requestId)
    .eq("project_id", projectId)
    .eq("status", "pending");
  if (requestUpdateError) return Response.json({ error: "The member was added, but the request status could not be updated." }, { status: 500 });

  return Response.json({ projectId, requestId, memberIds: nextMemberIds, numMembers: nextMemberCount, status: "accepted" });
}
