export const FACULTY_DIRECTORY_URL = "https://ucm.calpoly.edu/faculty-experts";
export const FACULTY_CATALOG_URL = "https://catalog.calpoly.edu/faculty-staff/";

export type FacultyExpert = { name: string; expertise: string[]; url: string; evidence?: "research" | "department" };
export type FacultyResult = FacultyExpert & { reason: string };
export type FacultyResponse = {
  faculty: FacultyResult[]; source: string; mode: "directory" | "ai";
  fallbackReason?: "no_key" | "ai_unavailable";
  discovery?: "web" | "catalog";
};

export function plainText(html: string): string {
  const entities: Record<string, string> = { amp: "&", nbsp: " ", quot: '"', apos: "'", lt: "<", gt: ">", euml: "ë" };
  return html.replace(/<[^>]*>/g, " ").replace(/&(#x[\da-f]+|#\d+|\w+);/gi, (original, entity: string) => {
    if (!entity.startsWith("#")) return entities[entity.toLowerCase()] ?? original;
    const value = entity.toLowerCase().startsWith("#x") ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return value > 0 && value <= 0x10ffff ? String.fromCodePoint(value) : "";
  }).replace(/\s+/g, " ").trim();
}

// Catalog entries provide department affiliation, not verified research specialties.
export function parseFacultyCatalog(html: string): FacultyExpert[] {
  const experts: FacultyExpert[] = [];
  for (const row of html.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
    if (cells.length < 2 || !/professor|lecturer|instructor/i.test(plainText(cells[1][1]))) continue;
    const parts = cells[0][1].split(/<br\s*\/?\s*>/i);
    if (parts.length < 2) continue;
    const sourceName = plainText(parts[0]).replace(/\s*\(\d{4}\)\s*/g, "").trim();
    const department = plainText(parts.slice(1).join(" "));
    if (!sourceName || !department || /maritime|solano/i.test(department)) continue;
    const [last, ...first] = sourceName.split(",");
    const name = first.length ? `${first.join(",").trim()} ${last.trim()}` : sourceName;
    experts.push({ name, expertise: [department], evidence: "department",
      url: `${FACULTY_CATALOG_URL}#:~:text=${encodeURIComponent(sourceName)}` });
  }
  return experts;
}

// Read only the published two-column expertise table, not navigation or biographies.
// If Cal Poly changes its markup, fail visibly rather than inventing faculty.
export function parseFacultyDirectory(html: string): FacultyExpert[] {
  const experts = new Map<string, FacultyExpert>();
  for (const table of html.matchAll(/<table\b[^>]*>([\s\S]*?)<\/table>/gi)) {
    if (!/Area of Expertise/i.test(plainText(table[1]))) continue;
    for (const row of table[1].matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
      const cells = [...row[1].matchAll(/<td\b[^>]*>([\s\S]*?)<\/td>/gi)];
      if (cells.length !== 2) continue;
      const expertise = plainText(cells[0][1]);
      if (!expertise || expertise.length > 200) continue;
      for (const link of cells[1][1].matchAll(/<a\b[^>]*href\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
        const name = plainText(link[2]);
        let url: URL;
        try { url = new URL(link[1], FACULTY_DIRECTORY_URL); } catch { continue; }
        if (url.protocol !== "https:" || url.hostname !== "ucm.calpoly.edu" ||
            !url.pathname.startsWith("/faculty-experts/") || url.username || url.password || !name || name.length > 150) continue;
        url.search = "";
        url.hash = "";
        const entry = experts.get(url.href) ?? { name, url: url.href, expertise: [] };
        if (!entry.expertise.includes(expertise)) entry.expertise.push(expertise);
        experts.set(url.href, entry);
      }
    }
  }
  return [...experts.values()];
}

// These are search synonyms, not additional claims about an individual faculty member.
const relatedTopics: [RegExp, string[]][] = [
  [/\b(react|software|coding|programming|web|computer|ai|artificial intelligence)\b/, ["computer science"]],
  [/\b(sustainability|sustainable|climate|environment|environmental)\b/, ["climate change"]],
  [/\b(robot|robots|robotics|autonomous)\b/, ["automotive safety", "technology ethics", "computer science"]],
  [/\b(security|cyber|encryption|cryptography)\b/, ["cybersecurity"]],
  [/\b(energy|solar|electricity|renewable)\b/, ["power and energy"]],
  [/\b(startup|business|entrepreneurship)\b/, ["entrepreneurship", "economics"]],
  [/\b(health|healthcare|medical)\b/, ["public health", "biomedical engineering"]],
  [/\b(music|audio|musical)\b/, ["music"]],
];

export function rankFaculty(experts: FacultyExpert[], query: string): FacultyResult[] {
  const words = query.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  const ignored = new Set(["the", "and", "for", "with", "project", "build", "student", "students", "want", "need", "help", "that", "this"]);
  const tokens = [...new Set(words.filter((word) => word.length >= 3 && !ignored.has(word)))];
  const expanded = relatedTopics.filter(([pattern]) => pattern.test(query.toLowerCase())).flatMap(([, topics]) => topics);
  return experts.map((expert) => {
    const matched = expert.expertise.filter((topic) => {
      const topicWords: string[] = topic.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
      return tokens.some((word) => topicWords.includes(word)) || expanded.includes(topic.toLowerCase());
    });
    return { ...expert, score: matched.length, reason: `${expert.evidence === "department" ? "Related department" : "Related published expertise"}: ${matched.join("; ")}.` };
  }).filter((expert) => expert.score > 0)
    .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name))
    .filter((expert, index, list) => list.findIndex((other) => other.name.toLowerCase() === expert.name.toLowerCase()) === index)
    .slice(0, 3).map(({ name, expertise, url, reason, evidence }) => ({ name, expertise, url, reason, evidence }));
}
