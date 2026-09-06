"use client";

import { useState } from "react";
import ProjectFeed from "./components/ProjectFeed";
import type { Project } from "./components/ProjectCard";
import JoinRequestForm from "./components/JoinRequestForm";
import SiteHeader from "./components/SiteHeader";

type AppProps = {
  projects: Project[];
  accountLabel: string | null;
};

export default function App({ projects, accountLabel }: AppProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={accountLabel} />
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
              <span className="font-bold">{selectedProject.owner_name ?? "This project"}</span>
              {" is selected. Its full details and join flow can open here"}
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
      {selectedProject && (
        <JoinRequestForm
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </main>
  );
}
