import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ requestId: string }> },
) {
  const { requestId } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || body.status !== "approved") {
    return Response.json({ error: "Only approving a join request is supported." }, { status: 400 });
  }

  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return Response.json({ error: "You must be signed in to accept a request." }, { status: 401 });
  }

  const { data: joinRequest, error: requestError } = await supabase
    .from("join_requests")
    .select("id, project_id")
    .eq("id", requestId)
    .maybeSingle();
  if (requestError) return Response.json({ error: "Unable to find this request." }, { status: 500 });
  if (!joinRequest) return Response.json({ error: "This request no longer exists." }, { status: 404 });

  const { data: project, error: projectError } = await supabase
    .from("user_projects")
    .select("owner")
    .eq("proj_id", joinRequest.project_id)
    .eq("owner", user.id)
    .maybeSingle();
  if (projectError) return Response.json({ error: "Unable to verify project ownership." }, { status: 500 });
  if (!project) return Response.json({ error: "Only the project owner can accept requests." }, { status: 403 });

  const { data, error } = await supabase
    .from("join_requests")
    .update({ status: "approved" })
    .eq("id", requestId)
    .select()
    .single();
  if (error) {
    console.error("Unable to approve join request", error);
    return Response.json({ error: "Unable to approve this request." }, { status: 500 });
  }

  return Response.json(data);
}
