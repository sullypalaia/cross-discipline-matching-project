"use client";

import { useMemo, useState } from "react";
import ProjectCard, { type Project } from "./ProjectCard";
import { projectTagPresets } from "@/lib/projectTags";

type ProjectFeedProps = {
  projects: Project[];
};

export default function ProjectFeed({
  projects,
}: ProjectFeedProps) {
  const [query, setQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const tags = useMemo(
    () =>
      Array.from(
        new Set([
          ...projectTagPresets,
          ...projects.flatMap((project) => project.tags),
        ]),
      ).sort(),
    [projects],
  );
  const toggleTag = (tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  };
  const visibleProjects = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return projects.filter((project) => {
      const matchesTag =
        selectedTags.length === 0 ||
        selectedTags.some((tag) => project.tags.includes(tag));
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
        matchesTag && (!normalizedQuery || searchable.includes(normalizedQuery))
      );
    });
  }, [projects, query, selectedTags]);
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
          <p className="mt-2 max-w-xl text-pretty text-slate-600">
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
        <div className="rounded-xl border border-slate-200 bg-white p-3 md:min-w-72">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-slate-700">
              Filter by tags
            </span>
            {selectedTags.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTags([])}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                Clear tags
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-slate-500">
            Show projects with any selected tag
          </p>
          <div className="mt-3 flex max-h-32 flex-wrap gap-2 overflow-y-auto">
            {tags.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => toggleTag(tag)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    isSelected
                      ? "border-indigo-300 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  {isSelected && <span aria-hidden="true">&#10003; </span>}
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </div>
      {visibleProjects.length > 0 ?
        <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {visibleProjects.map((project) => (
            <ProjectCard
              key={`${project.owner}-${project.created_at}`}
              project={project}
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
              setSelectedTags([]);
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
