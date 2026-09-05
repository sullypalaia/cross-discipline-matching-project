"use client";

export type Project = {
  id: string;
  title?: string;
  tags: string[];
  description: string;
  owner: string;
  lookingFor: string[];
  hours_per_week: number;
  num_members: number;
  created_at: string;
};

type ProjectCardProps = {
  project: Project;
  isSelected?: boolean;
  onSelect: (project: Project) => void;
};

export default function ProjectCard({
  project,
  isSelected = false,
  onSelect,
}: ProjectCardProps) {
  const ownerInitials = project.owner
    .split(/\s+/)
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 ${isSelected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
            style={{ backgroundColor: "#5b5bd6" }}
            aria-hidden="true"
          >
            {ownerInitials}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {project.owner}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Posted {new Date(project.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
            >
              {tag}
            </span>
          ))}
        </div>
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-600">
          {project.description}
        </p>
      </div>
      <div className="mt-6 border-t border-slate-100 pt-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Looking for
        </p>
        <p className="mt-1.5 text-sm font-medium text-slate-700">
          {project.lookingFor.join(" · ")}
        </p>
      </div>
      <div className="mt-auto flex items-center justify-between pt-6 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">◷</span> {project.hours_per_week} hrs/week
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">◉</span> {project.num_members} members
        </span>
      </div>
      <button
        type="button"
        onClick={() => onSelect(project)}
        className="mt-5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-indigo-600 hover:bg-indigo-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {isSelected ? "Selected" : "View project"}
      </button>
    </article>
  );
}
