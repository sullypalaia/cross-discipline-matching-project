import "server-only";
import type { Match, Profile, Project } from "@/app/types/matching";

const normalize = (value: string) => value.trim().toLowerCase();

// Sample mode: exact skill overlap (3 points) and interest phrases (1 point).
// Availability is a hard filter; ties retain the supplied project order.
// Future provider replacement belongs here, on the server. Keep validating IDs
// and explanations against supplied projects; never expose credentials to clients.
export async function matchProjects(profile: Profile, projects: Project[]): Promise<Match[]> {
  const skills = new Set(profile.skills.map(normalize));
  const interests = [...new Set(profile.interests.map(normalize))];
  const seen = new Set<string>();
  return projects.flatMap((project, index) => {
    if (seen.has(project.id)) return [];
    seen.add(project.id);
    if (project.hoursPerWeek > profile.hoursPerWeek) return [];
    const overlap = [...new Set(project.skillsNeeded.map(normalize))].filter((skill) => skills.has(skill));
    const content = normalize(`${project.title} ${project.description} ${project.skillsNeeded.join(" ")}`);
    const related = interests.filter((interest) => {
      // Boundaries avoid matching "art" inside "cart" while preserving C++ etc.
      const escaped = interest.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`(^|[^\\p{L}\\p{N}])${escaped}(?=$|[^\\p{L}\\p{N}])`, "u").test(content);
    });
    const score = overlap.length * 3 + related.length;
    if (!score) return [];
    const reasons = [
      overlap.length ? `Skills in common: ${overlap.slice(0, 3).join(", ")}.` : "",
      related.length ? `Project text mentions your interests: ${related.slice(0, 3).join(", ")}.` : "",
      `Needs ${project.hoursPerWeek} hours/week; you have ${profile.hoursPerWeek}.`,
    ].filter(Boolean);
    return [{ projectId: project.id, reason: reasons.join(" "), score, index }];
  }).sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, 3).map(({ projectId, reason }) => ({ projectId, reason }));
}
