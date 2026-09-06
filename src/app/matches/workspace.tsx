"use client";

import { useState } from "react";
import ProfileForm from "@/components/ai/ProfileForm";
import ProjectMatcher from "@/components/ai/ProjectMatcher";
import FacultyFinder from "@/components/ai/FacultyFinder";
import type { Profile, Project } from "@/app/types/matching";
import { createClient } from "@/utils/supabase/clients";

type Props = { initialProfile: Profile | null; projects: Project[]; userId: string };

export default function MatchesWorkspace({ initialProfile, projects, userId }: Props) {
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  async function saveProfile(nextProfile: Profile) {
    const { error } = await createClient().from("profiles").upsert({
      id: userId,
      skills: nextProfile.skills,
      interests: nextProfile.interests,
      hours_per_week: nextProfile.hoursPerWeek,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    setProfile(nextProfile);
  }

  return (
    <div className="mt-8 space-y-6">
      <ProfileForm initialProfile={profile} onSave={saveProfile} />
      {selectedProject && <p role="status" className="rounded-xl bg-indigo-50 px-4 py-3 text-sm font-medium text-indigo-900">{selectedProject.title} is selected. Return to Explore to view the project and request to join.</p>}
      <ProjectMatcher profile={profile} projects={projects} onSelectProject={setSelectedProjectId} />
      <FacultyFinder />
    </div>
  );
}
