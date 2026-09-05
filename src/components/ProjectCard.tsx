"use client";

export type Project = {
  id: string;
  title: string;
  description: string;
  owner: string;
  ownerInitials: string;
  ownerColor: string;
  disciplines: string[];
  lookingFor: string[];
  commitment: string;
  stage: string;
  members: number;
  posted: string;
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
  return (
    <article
      className={`group flex h-full flex-col rounded-3xl border bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/70 ${isSelected ? "border-indigo-500 ring-2 ring-indigo-100" : "border-slate-200"}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            className="grid size-11 shrink-0 place-items-center rounded-2xl text-sm font-bold text-white"
            style={{ backgroundColor: project.ownerColor }}
            aria-hidden="true"
          >
            {project.ownerInitials}
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">
              {project.owner}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Posted {project.posted}
            </p>
          </div>
        </div>
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          {project.stage}
        </span>
      </div>
      <div className="mt-6">
        <div className="flex flex-wrap gap-2">
          {project.disciplines.map((discipline) => (
            <span
              key={discipline}
              className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
            >
              {discipline}
            </span>
          ))}
        </div>
        <h2 className="mt-4 text-xl font-bold tracking-tight text-slate-950">
          {project.title}
        </h2>
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
          <span aria-hidden="true">◷</span> {project.commitment}
        </span>
        <span className="flex items-center gap-1.5">
          <span aria-hidden="true">◉</span> {project.members} members
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
