"use client";

import { useState } from "react";
import ProjectFeed from "./components/ProjectFeed";
import type { Project } from "./components/ProjectCard";
import JoinRequestForm from "./components/JoinRequestForm";

const demoProjects: Project[] = [
  {
    id: "urban-soundscapes",
    title: "Urban Soundscapes for Safer Streets",
    description:
      "A small team is designing an interactive map that turns neighborhood noise data into clearer, safer walking routes after dark.",
    owner: "Maya Chen",
    ownerInitials: "MC",
    ownerColor: "#5b5bd6",
    disciplines: ["Design", "Data"],
    lookingFor: ["Frontend developer", "Urban researcher"],
    commitment: "4–6 hrs/week",
    stage: "Forming team",
    members: 2,
    posted: "2 hours ago",
  },
  {
    id: "food-waste-lab",
    title: "The Community Food Waste Lab",
    description:
      "Help local cafés test a playful system for tracking surplus ingredients and connecting them with community kitchens.",
    owner: "Jordan Patel",
    ownerInitials: "JP",
    ownerColor: "#e26d44",
    disciplines: ["Business", "Sustainability"],
    lookingFor: ["Service designer", "Operations thinker"],
    commitment: "3 hrs/week",
    stage: "Researching",
    members: 3,
    posted: "Yesterday",
  },
  {
    id: "memory-garden",
    title: "Memory Garden: Stories in Augmented Reality",
    description:
      "We are collecting family stories and planting them in a shared AR garden—part oral history, part public art experiment.",
    owner: "Amara Okafor",
    ownerInitials: "AO",
    ownerColor: "#188878",
    disciplines: ["Arts", "Technology"],
    lookingFor: ["3D artist", "Community organizer"],
    commitment: "5 hrs/week",
    stage: "Prototyping",
    members: 4,
    posted: "2 days ago",
  },
  {
    id: "climate-letters",
    title: "Climate Letters: A Toolkit for Classrooms",
    description:
      "Create a gentle, evidence-led writing toolkit that helps young people turn climate anxiety into local action.",
    owner: "Leo Martin",
    ownerInitials: "LM",
    ownerColor: "#ad6bba",
    disciplines: ["Education", "Writing"],
    lookingFor: ["Climate scientist", "Learning designer"],
    commitment: "2–4 hrs/week",
    stage: "Seeking contributors",
    members: 2,
    posted: "3 days ago",
  },
  {
    id: "accessibility-atlas",
    title: "Accessibility Atlas",
    description:
      "A living, community-verified guide to the accessible entrances, bathrooms, and quiet spaces in our city.",
    owner: "Nico Reyes",
    ownerInitials: "NR",
    ownerColor: "#3179b9",
    disciplines: ["Civic Tech", "Design"],
    lookingFor: ["Mobile developer", "Accessibility advocate"],
    commitment: "4 hrs/week",
    stage: "Building",
    members: 5,
    posted: "4 days ago",
  },
  {
    id: "night-sky-notes",
    title: "Night Sky Notes",
    description:
      "An audio-first stargazing journal for beginners, built around shared observations rather than perfect astrophotography.",
    owner: "Sofia Laurent",
    ownerInitials: "SL",
    ownerColor: "#c38c2d",
    disciplines: ["Science", "Audio"],
    lookingFor: ["Sound designer", "iOS developer"],
    commitment: "3–5 hrs/week",
    stage: "Forming team",
    members: 2,
    posted: "Last week",
  },
];

export default function App() {
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
          <button
            type="button"
            className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
          >
            Post a project
          </button>
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
              <span className="font-bold">{selectedProject.title}</span> is
              selected. Its full details and join flow can open here when those
              views are connected.
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
            projects={demoProjects}
            selectedProjectId={selectedProject?.id}
            onSelectProject={setSelectedProject}
          />
        </div>
      </div>
      {selectedProject && <JoinRequestForm project={selectedProject} onClose={() => setSelectedProject(null)} />}
    </main>
  );
}
