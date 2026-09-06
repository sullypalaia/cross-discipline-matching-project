"use client";

// DEMO ONLY — SAFE TO DELETE AFTER INTEGRATION:
// Student 1 can delete this entire page once the real app saves a profile,
// matches Student 2's actual projects, and opens Student 3's detail view by ID.
// Components are now placed in the real app; shared profile persistence is pending.
// Deleting this file removes /matching-demo, not the reusable feature components.
// Keep src/components/ai, src/lib/ai, src/app/api/match, and the matching types.
// Student 4 owns this testing page until that handoff is complete.

import { useState } from "react";
import ProfileForm from "@/components/ai/ProfileForm";
import ProjectMatcher from "@/components/ai/ProjectMatcher";
import FacultyFinder from "@/components/ai/FacultyFinder";
import type { Profile, Project } from "@/app/types/matching";

// DELETE WITH THIS DEMO: fictional sampleProjects, local profile/selection state,
// empty-project checkbox, saved-profile message, and selection confirmation panel.
// Do not copy these into shared storage. Student 2 owns real project creation.
// Test fixtures only. No shared storage, database, or browser storage is used.
const sampleProjects: Project[] = [
  {
    id: "sample-green-campus",
    title: "Sample: Green Campus Website",
    description: "Build a sustainability website for students to share campus resources.",
    skillsNeeded: ["React", "design"],
    hoursPerWeek: 4,
  },
  {
    id: "sample-campus-robot",
    title: "Sample: Campus Robot",
    description: "Build a robotics demo that helps students explore campus.",
    skillsNeeded: ["electronics", "CAD"],
    hoursPerWeek: 5,
  },
  {
    id: "sample-student-magazine",
    title: "Sample: Student Magazine",
    description: "Create a magazine about student art and music.",
    skillsNeeded: ["writing", "photography"],
    hoursPerWeek: 3,
  },
];

export default function MatchingDemo() {
  // TODO(team integration): Student 1 replaces this demo's in-memory Profile
  // and Project[] with shared state when placing the components in the real app.
  const [profile, setProfile] = useState<Profile | null>(null);
  const [empty, setEmpty] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = sampleProjects.find((project) => project.id === selectedId);

  return (
    <main className="mx-auto w-full max-w-3xl space-y-6 p-6 sm:p-10">
      <header className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide">Student 4 · Sample demo</p>
        <h1 className="text-3xl font-semibold">Try profiles and matching</h1>
        <p>This page works without the rest of the app. Projects are fictional, and your saved profile resets when you refresh.</p>
        <p>Start with skills <strong>React</strong>, interests <strong>sustainability</strong>, and <strong>6</strong> hours. Save, then click “Find my matches.”</p>
      </header>

      <ProfileForm initialProfile={profile} onSave={setProfile} />
      <p role="status" className="rounded-lg bg-zinc-100 p-4 dark:bg-zinc-900">
        {profile ? `Saved for this demo: ${profile.skills.join(", ")} · ${profile.interests.join(", ")} · ${profile.hoursPerWeek} hours/week.` : "No profile saved yet."}
      </p>

      <label className="flex items-center gap-3">
        <input type="checkbox" checked={empty} onChange={(event) => { setEmpty(event.target.checked); setSelectedId(null); }} />
        Test with no available projects
      </label>
      <ProjectMatcher profile={profile} projects={empty ? [] : sampleProjects} onSelectProject={setSelectedId} />
      <FacultyFinder />

      {/* TODO(team integration): Student 1 connects onSelectProject(id) to
          Student 3's actual detail view. This panel only confirms the received ID. */}
      {selected && (
        <section className="rounded-xl border border-zinc-300 p-6 dark:border-zinc-700" aria-label="Demo project selection">
          <h2 className="text-xl font-semibold">Selection callback worked</h2>
          <p className="mt-2">{selected.title}</p>
          <p className="mt-2">Received project ID: <code>{selected.id}</code></p>
          <p className="mt-2 text-sm">This is a demo confirmation. The real project detail page will be connected by your teammates.</p>
        </section>
      )}

      <details className="rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
        <summary className="cursor-pointer font-semibold">See the three sample projects</summary>
        <ul className="mt-4 space-y-3">
          {sampleProjects.map((project) => <li key={project.id}>
            <strong>{project.title}</strong>: {project.skillsNeeded.join(", ")} · {project.hoursPerWeek} hours/week.
          </li>)}
        </ul>
      </details>
    </main>
  );
}
