"use client";

import { useState } from "react";
import Link from "next/link";
import JoinRequestForm from "./JoinRequestForm";
import type { Project } from "./ProjectCard";

type Props = {
  project: Project;
  accountName: string | null;
  isOwner: boolean;
  hasRequested: boolean;
};

export default function ProjectJoinAction({
  project,
  accountName,
  isOwner,
  hasRequested,
}: Props) {
  const [formOpen, setFormOpen] = useState(false);

  if (!accountName) {
    return (
      <Link
        href="/login"
        className="inline-flex rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Sign in to request to join
      </Link>
    );
  }

  if (isOwner) {
    return <p className="text-sm font-medium text-slate-600">You created this project.</p>;
  }

  if (hasRequested) {
    return <p className="text-sm font-medium text-emerald-700">Your request to join has been sent.</p>;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setFormOpen(true)}
        className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Request to join
      </button>
      {formOpen && (
        <JoinRequestForm
          project={project}
          accountName={accountName}
          onClose={() => setFormOpen(false)}
        />
      )}
    </>
  );
}
