import { recommendProjects } from "@/lib/ai/recommendProjects";
import { isMatchRequest, requestError } from "@/lib/ai/validation";
import type { MatchError, MatchResponse } from "@/app/types/matching";

function failure(error: string, status: number) {
  return Response.json({ error } satisfies MatchError, { status });
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return failure("Send valid JSON containing profile and projects.", 400);
  }
  if (!isMatchRequest(body)) return failure(requestError(body) ?? "Invalid matching request.", 400);
  try {
    const result: MatchResponse = await recommendProjects(body.profile, body.projects);
    return Response.json(result);
  } catch {
    return failure("Matching is temporarily unavailable. Please try again.", 500);
  }
}
