import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !body.name.trim() || typeof body.why !== "string" || !body.why.trim() || typeof body.help !== "string" || !body.help.trim() || !Number.isFinite(body.hoursPerWeek) || body.hoursPerWeek <= 0 || !["in-person", "online"].includes(body.modality)) return Response.json({ error: "Complete all fields and provide a positive commitment." }, { status: 400 });

  const supabase = createClient(await cookies());
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return Response.json({ error: "You must be signed in to request to join a project." }, { status: 401 });

  const { data: project, error: projectError } = await supabase.from("user_projects").select("proj_id, owner").eq("proj_id", projectId).maybeSingle();
  if (projectError) return Response.json({ error: "Unable to verify this project." }, { status: 500 });
  if (!project) return Response.json({ error: "This project no longer exists." }, { status: 404 });
  if (project.owner === user.id) return Response.json({ error: "You cannot request to join a project you created." }, { status: 403 });

  const { data: existingRequest, error: existingRequestError } = await supabase
    .from("join_requests")
    .select("id")
    .eq("project_id", projectId)
    .eq("requester_id", user.id)
    .maybeSingle();
  if (existingRequestError) return Response.json({ error: "Unable to verify your existing project requests." }, { status: 500 });
  if (existingRequest) return Response.json({ error: "You have already requested to join this project." }, { status: 409 });

  const { data: requestRecord, error } = await supabase.from("join_requests").insert({ project_id: projectId, requester_id: user.id, applicant_name: body.name.trim(), motivation: body.why.trim(), contribution: body.help.trim(), hours_per_week: body.hoursPerWeek, meeting_modality: body.modality, status: "pending" }).select().single();
  if (error) {
    console.error("Unable to save join request", error);
    return Response.json({ error: `Unable to save your request: ${error.message}` }, { status: 500 });
  }
  return Response.json(requestRecord, { status: 201 });
}
