"use client";

import ProjectMatcher from "@/components/ai/ProjectMatcher";
import FacultyFinder from "@/components/ai/FacultyFinder";
import type { Profile, Project } from "@/app/types/matching";

type Props = { initialProfile: Profile | null; projects: Project[] };

export default function MatchesWorkspace({ initialProfile, projects }: Props) {
  const profile = initialProfile;

  return (
    <div className="mt-8 space-y-7">
      <ProjectMatcher profile={profile} projects={projects} />
      <FacultyFinder />
    </div>
  );
}
