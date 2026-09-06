// TODO(team integration): Students 1 and 2 should adopt or map these fields to
// shared records. IDs must be stable strings, e.g. "solar-car", never array indexes.
export type Profile = {
  skills: string[];
  interests: string[];
  hoursPerWeek: number;
};

export type Project = {
  // TODO(team integration): Student 2 supplies these fields from project creation
  // and editing: string id/title/description, string[] skillsNeeded, and numeric
  // hoursPerWeek. Keep id unchanged on edits. Example: skillsNeeded: ["React"].
  // Student 1 maps any different shared field names before passing Project[].
  id: string;
  title: string;
  description: string;
  skillsNeeded: string[];
  hoursPerWeek: number;
};

export type Match = { projectId: string; reason: string };
export type MatchRequest = { profile: Profile; projects: Project[] };
export type MatchResponse = {
  matches: Match[];
  mode: "ai" | "manual";
  fallbackReason?: "no_key" | "ai_unavailable" | "no_eligible_projects";
};
export type MatchError = { error: string };

// KEEP: These types are imported by the form, matcher, validation, and endpoint.
// Student 1 may consolidate them into shared types only after updating all
// imports and coordinating the contract with Students 2 and 4; do not just delete.
