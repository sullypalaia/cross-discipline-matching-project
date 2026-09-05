"use client";

import { useEffect, useState, type FormEvent } from "react";

export type Project = {
  title: string;
  description: string;
  tags: string[];
};

type CreateProjectProps = {
  onCreate?: (project: Project) => void;
};

const suggestedTags = [
  "Not started yet",
  "In progress",
  "Finished",
  "Looking for teammates",
  "Open to collaborators",
];

const tagStyles: Record<string, string> = {
  "Not started yet": "border-slate-200 bg-slate-50 text-slate-700",
  "In progress": "border-amber-200 bg-amber-50 text-amber-700",
  Finished: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "Looking for teammates": "border-violet-200 bg-violet-50 text-violet-700",
  "Open to collaborators": "border-sky-200 bg-sky-50 text-sky-700",
};

export default function CreateProject({ onCreate }: CreateProjectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  const toggleTag = (tag: string) => {
    setSelectedTags((currentTags) =>
      currentTags.includes(tag)
        ? currentTags.filter((currentTag) => currentTag !== tag)
        : [...currentTags, tag],
    );
  };

  const addCustomTag = () => {
    const tag = customTag.trim();

    if (!tag || selectedTags.includes(tag)) {
      return;
    }

    setSelectedTags((currentTags) => [...currentTags, tag]);
    setCustomTag("");
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedTags([]);
    setCustomTag("");
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    onCreate?.({
      title: title.trim(),
      description: description.trim(),
      tags: selectedTags,
    });

    resetForm();
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2"
      >
        <span aria-hidden="true" className="text-lg leading-none">
          +
        </span>
        Create project
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-project-title"
            className="max-h-[calc(100vh-2rem)] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="mb-2 text-sm font-medium text-indigo-600">
                  Share something new
                </p>
                <h2
                  id="create-project-title"
                  className="text-2xl font-bold tracking-tight text-slate-950"
                >
                  Create a project
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Tell Cal Poly students what you&apos;re working on.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close create project dialog"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 text-2xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="project-title"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Project name
                </label>
                <input
                  id="project-title"
                  name="title"
                  type="text"
                  required
                  maxLength={80}
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Campus sustainability dashboard"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="project-description"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Description
                </label>
                <textarea
                  id="project-description"
                  name="description"
                  required
                  rows={4}
                  maxLength={500}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="What are you building, and what would you like others to know?"
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                />
              </div>

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-slate-800">
                  Add tags
                </legend>
                <div className="flex flex-wrap gap-2">
                  {suggestedTags.map((tag) => {
                    const isSelected = selectedTags.includes(tag);

                    return (
                      <button
                        key={tag}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => toggleTag(tag)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                          isSelected
                            ? (tagStyles[tag] ??
                              "border-indigo-300 bg-indigo-50 text-indigo-700")
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        {isSelected && (
                          <span aria-hidden="true">&#10003; </span>
                        )}
                        {tag}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={customTag}
                    onChange={(event) => setCustomTag(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        addCustomTag();
                      }
                    }}
                    placeholder="Add a custom tag"
                    maxLength={30}
                    className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
                  />
                  <button
                    type="button"
                    onClick={addCustomTag}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Add
                  </button>
                </div>

                {selectedTags.length > 0 && (
                  <div
                    className="mt-3 flex flex-wrap gap-2"
                    aria-label="Selected tags"
                  >
                    {selectedTags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-full border px-3 py-1 text-xs font-medium ${
                          tagStyles[tag] ??
                          "border-indigo-200 bg-indigo-50 text-indigo-700"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </fieldset>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  Create project
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  );
}
