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
    <main id="main-content" className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={accountLabel} />
      <div id="top">
        <div className="relative min-h-64 overflow-hidden bg-slate-950 text-white sm:min-h-80">
          <img
            src="https://www.calpoly.edu/sites/default/files/inline-images/glover-event-hero.jpg"
            alt="Victor Glover floating in space"
            className="absolute inset-0 size-full object-cover object-[center_28%]"
          />
          <div className="absolute inset-0 bg-slate-950/55" aria-hidden="true" />
          <blockquote className="relative z-10 mx-auto flex min-h-64 max-w-7xl flex-col justify-center px-5 py-8 text-2xl font-semibold leading-tight tracking-tight sm:min-h-80 sm:px-8 sm:text-4xl">
            <p>“If you want to go fast, go alone. But if you want to go far, go together”</p>
            <cite className="mt-4 text-sm font-medium not-italic text-slate-200 sm:text-base">
              — Victor Glover
            </cite>
          </blockquote>
        </div>
        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
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
      </div>
      {selectedProject && (
        <JoinRequestForm
          project={selectedProject}
          accountName={accountLabel ?? ""}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </main>
  );
}
