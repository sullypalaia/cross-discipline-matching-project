import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ error: "Unable to read your request." }, { status: 400 });
  }
  const name = formData.get("name");
  const why = formData.get("why");
  const help = formData.get("help");
  const hoursPerWeek = Number(formData.get("hoursPerWeek"));
  const modality = formData.get("modality");
  const normalizedModality = modality === "in-person" || modality === "online" ? modality : null;
  const attachment = formData.get("attachment");
  if (typeof name !== "string" || !name.trim() || typeof why !== "string" || !why.trim() || typeof help !== "string" || !help.trim() || !Number.isFinite(hoursPerWeek) || hoursPerWeek <= 0 || !normalizedModality) return Response.json({ error: "Complete all fields and provide a positive commitment." }, { status: 400 });
  if (attachment !== null && (!(attachment instanceof File) || attachment.size === 0)) return Response.json({ error: "Please choose a valid attachment." }, { status: 400 });
  if (attachment instanceof File && attachment.size > 10 * 1024 * 1024) return Response.json({ error: "Attachments must be 10 MB or smaller." }, { status: 400 });

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

  let attachmentPath: string | null = null;
  if (attachment instanceof File) {
    const safeName = attachment.name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(-120) || "attachment";
    attachmentPath = `${user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("join-request-attachments")
      .upload(attachmentPath, attachment, { contentType: attachment.type || "application/octet-stream", upsert: false });
    if (uploadError) {
      console.error("Unable to upload join request attachment", uploadError);
      return Response.json({ error: "Unable to upload your attachment." }, { status: 500 });
    }
  }

  const { data: requestRecord, error } = await supabase.from("join_requests").insert({ project_id: projectId, requester_id: user.id, applicant_name: name.trim(), motivation: why.trim(), contribution: help.trim(), hours_per_week: hoursPerWeek, meeting_modality: normalizedModality, status: "pending", attachment_path: attachmentPath, attachment_name: attachment instanceof File ? attachment.name : null, attachment_type: attachment instanceof File ? attachment.type || "application/octet-stream" : null, attachment_size: attachment instanceof File ? attachment.size : null }).select().single();
  if (error) {
    if (attachmentPath) {
      const { error: cleanupError } = await supabase.storage.from("join-request-attachments").remove([attachmentPath]);
      if (cleanupError) console.error("Unable to clean up failed join request attachment", cleanupError);
    }
    console.error("Unable to save join request", error);
    return Response.json({ error: `Unable to save your request: ${error.message}` }, { status: 500 });
  }
  return Response.json(requestRecord, { status: 201 });
}
