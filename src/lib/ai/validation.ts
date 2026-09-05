import type { MatchRequest, Profile } from "@/app/types/matching";

export const MAX_HOURS = 80;
export const MAX_PROJECTS = 200;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
const text = (value: unknown, max: number): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= max;
const tags = (value: unknown, required = true): value is string[] =>
  Array.isArray(value) && (!required || value.length > 0) &&
  value.length <= 30 && value.every((tag) => text(tag, 80));
const hours = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0 && value <= MAX_HOURS;

export function profileError(value: unknown): string | null {
  if (!record(value)) return "Save your skills, interests, and weekly availability first.";
  if (!tags(value.skills)) return "Add 1–30 skills, each up to 80 characters.";
  if (!tags(value.interests)) return "Add 1–30 interests, each up to 80 characters.";
  if (!hours(value.hoursPerWeek)) return `Enter weekly availability greater than 0 and no more than ${MAX_HOURS} hours.`;
  return null;
}

export function requestError(value: unknown): string | null {
  if (!record(value)) return "Send an object containing profile and projects.";
  const error = profileError(value.profile);
  if (error) return error;
  if (!Array.isArray(value.projects) || value.projects.length > MAX_PROJECTS)
    return `Send an array of at most ${MAX_PROJECTS} projects.`;
  const ids = new Set<string>();
  for (const project of value.projects) {
    if (!record(project) || !text(project.id, 120) || project.id !== project.id.trim() ||
        !text(project.title, 200) || !text(project.description, 5000) ||
        !tags(project.skillsNeeded, false) || !hours(project.hoursPerWeek))
      return "Each project needs a stable ID, title, description, skillsNeeded array, and weekly hours greater than 0 and at most 80.";
    if (ids.has(project.id)) return "Project IDs must be unique.";
    ids.add(project.id);
  }
  return null;
}

export function isMatchRequest(value: unknown): value is MatchRequest {
  return requestError(value) === null;
}

export function parseTags(value: string): string[] {
  const seen = new Set<string>();
  return value.split(",").map((tag) => tag.trim()).filter((tag) => {
    const key = tag.toLowerCase();
    if (!tag || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function profileFromForm(skills: string, interests: string, hours: string): Profile {
  return { skills: parseTags(skills), interests: parseTags(interests), hoursPerWeek: Number(hours) };
}
