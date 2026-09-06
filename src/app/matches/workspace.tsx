"use client";

import { useState } from "react";
import ProjectMatcher from "@/components/ai/ProjectMatcher";
import FacultyFinder from "@/components/ai/FacultyFinder";
import type { Profile, Project } from "@/app/types/matching";

type Props = { initialProfile: Profile | null; projects: Project[] };

export default function MatchesWorkspace({ initialProfile, projects }: Props) {
  const profile = initialProfile;
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  return (
    <div className="mt-8 space-y-7">
      {selectedProject && <p role="status" className="rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm font-medium text-indigo-900">{selectedProject.title} is selected. Return to Explore to view the project and request to join.</p>}
      <ProjectMatcher profile={profile} projects={projects} onSelectProject={setSelectedProjectId} />
      <FacultyFinder />
    </div>
  );
}
