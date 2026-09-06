"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Member = {
  id: string;
  name: string;
  isOwner: boolean;
};

type Props = {
  projectId: string;
  members: Member[];
  canRemoveMembers: boolean;
};

export default function ProjectMembers({
  projectId,
  members,
  canRemoveMembers,
}: Props) {
  const router = useRouter();
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function removeMember(member: Member) {
    if (!window.confirm(`Remove ${member.name} from this project?`)) return;

    setRemovingId(member.id);
    setError(null);
    try {
      const response = await fetch(
        `/api/projects/${encodeURIComponent(projectId)}/members/${encodeURIComponent(member.id)}`,
        { method: "DELETE" },
      );
      const result = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(result?.error || "Unable to remove this member.");
      }
      router.refresh();
    } catch (removalError) {
      setError(
        removalError instanceof Error
          ? removalError.message
          : "Unable to remove this member.",
      );
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {members.map((member) => (
          <li
            key={member.id}
            className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
          >
            <span
              className="grid size-9 shrink-0 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700"
              aria-hidden="true"
            >
              {member.name.charAt(0).toUpperCase()}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800">
              {member.name}
            </span>
            {member.isOwner ? (
              <span className="shrink-0 text-xs font-semibold text-indigo-600">Owner</span>
            ) : canRemoveMembers ? (
              <button
                type="button"
                onClick={() => removeMember(member)}
                disabled={removingId !== null}
                className="shrink-0 text-xs font-semibold text-rose-600 transition hover:text-rose-800 focus:outline-none focus:underline disabled:cursor-not-allowed disabled:opacity-50"
                aria-label={`Remove ${member.name} from this project`}
              >
                {removingId === member.id ? "Removing…" : "Remove"}
              </button>
            ) : null}
          </li>
        ))}
      </ul>
      {error && <p role="alert" className="mt-3 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
