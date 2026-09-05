import { NextRequest } from "next/server";

// Replace this scaffold with the authenticated session, project-membership
// lookup, persistence, and creator notification service when those exist.
export async function POST(request: NextRequest, context: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await context.params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body.name !== "string" || !Number.isFinite(body.hoursPerWeek) || body.hoursPerWeek <= 0) return Response.json({ error: "Valid name and positive hoursPerWeek are required." }, { status: 400 });
  return Response.json({ id: `request-${Date.now()}`, projectId, status: "pending", ...body, notification: "Notify project creator dashboard." }, { status: 201 });
}
