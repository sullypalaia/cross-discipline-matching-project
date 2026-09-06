"use client";

import { useState } from "react";
import Link from "next/link";
import CreateProject from "./components/CreateProject";
import ProjectFeed from "./components/ProjectFeed";
import type { Project } from "./components/ProjectCard";
import JoinRequestForm from "./components/JoinRequestForm";
import ProfileForm from "./components/ai/ProfileForm";
import ProjectMatcher from "./components/ai/ProjectMatcher";
import type { Profile } from "./app/types/matching";
import { isMatchingProject } from "./lib/ai/validation";
import FacultyFinder from "./components/ai/FacultyFinder";

type AppProps = {
  projects: Project[];
};

export default function App({ projects }: AppProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  // TODO(team integration): Student 1 replaces this session-only state with the
  // shared saved Profile and save callback. No separate browser storage is used.
  const [profile, setProfile] = useState<Profile | null>(null);
  const matchingProjects = projects.map((project) => ({
    id: project.id == null ? "" : String(project.id),
    title: project.title?.trim() || `${project.owner}'s project`,
    description: project.description,
    skillsNeeded: project.lookingFor,
    hoursPerWeek: project.hours_per_week,
  })).filter(isMatchingProject);
  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
          <a
            href="#top"
            className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950"
          >
            <span
              className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white"
              aria-hidden="true"
            >
              ✦
            </span>
            Crosspaths
          </a>
          <nav
            className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
            aria-label="Main navigation"
          >
            <Link href="/" className="text-indigo-600">
              Explore
            </Link>
            <Link href="/our-goal" className="transition hover:text-slate-950">
              Our Goal
            </Link>
            <a href="#profile" className="transition hover:text-slate-950">
              Find matches
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-950">
              How it works
            </a>
            <Link href="/account" className="transition hover:text-slate-950">
              My profile
            </Link>
          </nav>
          <CreateProject
            renderTrigger={(onClick) => (
              <button
                type="button"
                onClick={onClick}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Post a project
              </button>
            )}
          />
        </div>
      </header>
      <div id="top" className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="mb-10 overflow-hidden rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-10">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold text-indigo-300">
              One idea, many perspectives
            </p>
            <p className="mt-3 text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
              The right collaborator might be working in a field you have never
              explored.
            </p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">
              Crosspaths helps curious people find projects where their skills
              add a fresh point of view.
            </p>
          </div>
        </div>
        {selectedProject && (
          <div className="mb-7 flex flex-col gap-3 rounded-2xl border border-indigo-100 bg-indigo-50 px-5 py-4 text-sm text-indigo-950 sm:flex-row sm:items-center sm:justify-between">
            <p>
              <span className="font-bold">{selectedProject.owner}</span>
              &apos;s
              project is selected. Its full details and join flow can open here
              when those views are connected.
            </p>
            <button
              type="button"
              onClick={() => setSelectedProject(null)}
              className="shrink-0 font-semibold text-indigo-700 hover:text-indigo-950"
            >
              Dismiss
            </button>
          </div>
        )}
        <div id="projects">
          <ProjectFeed
            projects={projects}
            selectedProject={selectedProject ?? undefined}
            onSelectProject={setSelectedProject}
          />
        </div>
        <div id="profile" className="mt-10 space-y-6 rounded-3xl bg-white p-6">
          <h2 className="text-2xl font-bold">Your profile and project matches</h2>
          <p className="text-sm text-slate-600">Your profile is saved for this visit only and resets when you refresh.</p>
          <ProfileForm initialProfile={profile} onSave={setProfile} />
          {profile && <p role="status">Profile ready: {profile.skills.join(", ")} · {profile.hoursPerWeek} hours/week.</p>}
          {matchingProjects.length < projects.length && <p className="text-sm text-amber-800">
            {projects.length - matchingProjects.length} project(s) cannot be paired yet because their details are incomplete or invalid. Weekly hours must be greater than 0 and no more than 80.
          </p>}
          <ProjectMatcher profile={profile} projects={matchingProjects}
            onSelectProject={(id) => setSelectedProject(projects.find((project) => String(project.id) === id) ?? null)} />
          <FacultyFinder />
        </div>
      </div>
      {selectedProject && <JoinRequestForm project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}
