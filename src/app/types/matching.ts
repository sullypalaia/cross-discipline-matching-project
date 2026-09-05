// TODO(team integration): Students 1 and 2 should adopt or map these fields to
// shared records. IDs must be stable strings, e.g. "solar-car", never array indexes.
export type Profile = {
  skills: string[];
  interests: string[];
  hoursPerWeek: number;
};

export type Project = {
  id: string;
  title: string;
  description: string;
  skillsNeeded: string[];
  hoursPerWeek: number;
};

export type Match = { projectId: string; reason: string };
export type MatchRequest = { profile: Profile; projects: Project[] };
export type MatchResponse = { matches: Match[]; mode: "sample" };
export type MatchError = { error: string };
