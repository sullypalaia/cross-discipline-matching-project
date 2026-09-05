"use client";

import { useState } from "react";
import CreateProject from "./components/CreateProject";
import ProjectFeed from "./components/ProjectFeed";
import type { Project } from "./components/ProjectCard";
import JoinRequestForm from "./components/JoinRequestForm";

type AppProps = {
  projects: Project[];
};

export default function App({ projects }: AppProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
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
            <a href="#projects" className="text-indigo-600">
              Explore
            </a>
            <a href="#how-it-works" className="transition hover:text-slate-950">
              How it works
            </a>
            <a href="#profile" className="transition hover:text-slate-950">
              My profile
            </a>
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
      </div>
      {selectedProject && <JoinRequestForm project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}
