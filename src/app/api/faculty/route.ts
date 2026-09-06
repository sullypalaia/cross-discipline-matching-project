import { FACULTY_CATALOG_URL, FACULTY_DIRECTORY_URL, parseFacultyCatalog, parseFacultyDirectory, rankFaculty } from "@/lib/faculty/directory";
import { searchFacultyWeb } from "@/lib/faculty/searchFacultyWeb";

export const maxDuration = 90;

export async function POST(request: Request) {
  let query: unknown;
  try { query = (await request.json())?.query; } catch {
    return Response.json({ error: "Send a project topic as JSON." }, { status: 400 });
  }
  if (typeof query !== "string" || query.trim().length < 2 || query.length > 500)
    return Response.json({ error: "Enter a topic between 2 and 500 characters." }, { status: 400 });
  const hasKey = Boolean(process.env.API_AI_KEY?.trim());
  if (hasKey) {
    try { return Response.json(await searchFacultyWeb(query)); }
    catch { /* Fall back to actual catalog records; never label them live AI results. */ }
  }
  try {
    const sources = await Promise.allSettled([
      [FACULTY_CATALOG_URL, parseFacultyCatalog] as const,
      [FACULTY_DIRECTORY_URL, parseFacultyDirectory] as const,
    ].map(async ([url, parse]) => {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: "error", next: {revalidate:3600} });
      if (!response.ok) throw new Error("Directory unavailable");
      return parse(await response.text());
    }));
    const experts = sources.flatMap((source) => source.status === "fulfilled" ? source.value : []);
    if (!experts.length) throw new Error("Directory format changed");
    return Response.json({faculty:rankFaculty(experts,query),source:FACULTY_CATALOG_URL,mode:"directory",discovery:"catalog",
      fallbackReason:hasKey ? "ai_unavailable" : "no_key"});
  } catch {
    return Response.json({ error: "Cal Poly’s faculty directory could not be loaded. Try again or open the official directory below." }, { status: 503 });
  }
}
