"use client";

import { useMemo, useState } from "react";
import ProjectCard, { type Project } from "./ProjectCard";

type ProjectFeedProps = {
  projects: Project[];
  selectedProject?: Project;
  onSelectProject: (project: Project) => void;
};
const allTags = "All tags";

export default function ProjectFeed({
  projects,
  selectedProject,
  onSelectProject,
}: ProjectFeedProps) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState(allTags);
  const tags = useMemo(
    () => [
      allTags,
      ...Array.from(new Set(projects.flatMap((project) => project.tags))).sort(),
    ],
    [projects],
  );
  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesTag = tag === allTags || project.tags.includes(tag);
      const searchable = [
        project.description,
        project.owner,
        project.owner_name ?? "",
        ...project.tags,
        ...project.lookingFor,
      ]
        .join(" ")
        .toLowerCase();
      return (
        matchesTag &&
        (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });
  }, [projects, query, tag]);
  return (
    <section aria-labelledby="project-feed-heading">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <h1
            id="project-feed-heading"
            className="mt-1 text-3xl font-bold tracking-tight text-slate-950"
          >
          Find your team.
          </h1>
          <p className="mt-2 max-w-xl text-slate-600">
            Meet people from different disciplines and turn a promising idea
            into something real.
          </p>
        </div>
        <p className="shrink-0 text-sm font-medium text-slate-500">
          {visibleProjects.length}{" "}
          {visibleProjects.length === 1 ? "project" : "projects"}
        </p>
      </div>
      <div className="mt-7 grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm md:grid-cols-[1fr_auto]">
        <label className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 text-slate-400 focus-within:ring-2 focus-within:ring-indigo-500">
          <span aria-hidden="true">⌕</span>
          <span className="sr-only">Search projects</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search projects, skills, or people"
            className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
          />
        </label>
        <label className="relative">
          <span className="sr-only">Filter by tag</span>
          <select
            value={tag}
            onChange={(event) => setTag(event.target.value)}
            className="h-full min-h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-medium text-slate-700 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 md:w-48"
          >
            {tags.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <span
            className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
            aria-hidden="true"
          >
            ▾
          </span>
        </label>
      </div>
      {visibleProjects.length > 0 ?
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={`${project.owner}-${project.created_at}`}
              project={project}
              isSelected={selectedProject === project}
              onSelect={onSelectProject}
            />
          ))}
        </div>
      : <div className="mt-7 rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <p className="text-lg font-semibold text-slate-900">
            No projects match that search.
          </p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setTag(allTags);
            }}
            className="mt-3 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
          >
            Clear filters
          </button>
        </div>
      }
    </section>
  );
}
