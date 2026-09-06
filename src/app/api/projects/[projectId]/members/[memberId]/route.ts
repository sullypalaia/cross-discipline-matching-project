import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ projectId: string; memberId: string }> },
) {
  const { projectId, memberId } = await context.params;
  const supabase = createClient(await cookies());
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "You must be signed in to manage members." }, { status: 401 });
  }

  const { data: project, error: projectError } = await supabase
    .from("user_projects")
    .select("owner, member_ids")
    .eq("proj_id", projectId)
    .maybeSingle();
  if (projectError) {
    return Response.json({ error: "Unable to verify this project." }, { status: 500 });
  }
  if (!project) {
    return Response.json({ error: "This project no longer exists." }, { status: 404 });
  }
  if (project.owner !== user.id) {
    return Response.json({ error: "Only the project owner can remove members." }, { status: 403 });
  }
  if (memberId === project.owner) {
    return Response.json({ error: "The project owner cannot be removed." }, { status: 400 });
  }

  const currentMemberIds = Array.from(
    new Set(
      (Array.isArray(project.member_ids) ? project.member_ids : []).filter(
        (id): id is string => typeof id === "string" && Boolean(id),
      ),
    ),
  );
  if (!currentMemberIds.includes(memberId)) {
    return Response.json({ error: "This person is not a member of the project." }, { status: 404 });
  }

  const nextMemberIds = [
    project.owner,
    ...currentMemberIds.filter((id) => id !== memberId && id !== project.owner),
  ];
  const { error: updateError } = await supabase
    .from("user_projects")
    .update({ member_ids: nextMemberIds, num_members: nextMemberIds.length })
    .eq("proj_id", projectId)
    .eq("owner", user.id);

  if (updateError) {
    return Response.json({ error: "Unable to remove this member." }, { status: 500 });
  }
  return Response.json({ memberIds: nextMemberIds });
}
