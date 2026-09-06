"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { MatchResponse, Profile, Project } from "@/app/types/matching";
import { requestError } from "@/lib/ai/validation";

type Props = {
  // KEEP: Student 4 owns this component and /api/match. Integration belongs in
  // Student 1's parent component; result labels reflect the server's actual mode.
  // TODO(team integration): Student 1 passes the saved Profile (or null) and
  // current available Project[] from shared storage; Student 2 supplies the fields.
  profile: Profile | null;
  projects: Project[];
};

export default function ProjectMatcher(props: Props) {
  // Any changed input remounts the session, hiding stale results immediately and
  // aborting the old request. Equal data in a new array does not clear results.
  return (
    <MatchingSession
      key={JSON.stringify([props.profile, props.projects])}
      {...props}
    />
  );
}

function MatchingSession({ profile, projects }: Props) {
  const router = useRouter();
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  const problem = requestError({ profile, projects });

  useEffect(
    () => () => {
      active.current?.abort();
    },
    [],
  );

  async function findMatches() {
    if (active.current) return;
    if (problem || projects.length === 0) {
      setError(problem || "No valid projects are available to match yet.");
      return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profile, projects }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Request failed");
      const data = await response.json();
      const ids = new Set(projects.map((project) => project.id));
      const seen = new Set<string>();
      if (
        !["ai", "manual"].includes(data?.mode) ||
        !Array.isArray(data.matches) ||
        data.matches.length > 3 ||
        !data.matches.every(
          (match: { projectId?: unknown; reason?: unknown } | null) => {
            if (
              !match ||
              typeof match.projectId !== "string" ||
              !ids.has(match.projectId) ||
              seen.has(match.projectId) ||
              typeof match.reason !== "string" ||
              !match.reason.trim()
            )
              return false;
            seen.add(match.projectId);
            return true;
          },
        )
      )
        throw new Error("Invalid response");
      setResult(data);
    } catch {
      setError("Could not load matches. Check your connection and try again.");
    } finally {
      clearTimeout(timeout);
      active.current = null;
      setLoading(false);
    }
  }

  return (
    <section
      className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"
      aria-busy={loading}
    >
      <div className="border-b border-slate-100 bg-linear-to-br from-indigo-50 via-white to-white px-6 py-7 sm:px-8">
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Projects for you
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-pretty leading-6 text-slate-600">
          Find projects that fit your skills, interests, and weekly hours. Uses
          AI when available, otherwise rule-based pairing.
        </p>
      </div>
      <div className="px-6 py-6 sm:px-8">
        <p className="text-sm leading-6 text-pretty text-slate-500">
          When AI is enabled, your saved skills, interests, availability, and
          project descriptions are sent to OpenAI when you find matches.
        </p>
        {result && (
          <p
            className="mt-4 text-sm font-semibold text-slate-700"
            role="status"
          >
            {result.mode === "ai" ?
              "AI pairing · OpenAI"
            : result.fallbackReason === "ai_unavailable" ?
              "AI is unavailable. Showing rule-based pairing instead."
            : "Manual pairing · skill and interest rules (no AI used)."}
          </p>
        )}
        {problem && (
          <p
            className="mt-5 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900"
            role="status"
          >
            {problem}
          </p>
        )}
        {!projects.length && (
          <p className="mt-5 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
            No projects are available yet. Check back after students post
            projects.
          </p>
        )}
        <button
          type="button"
          onClick={findMatches}
          disabled={loading}
          className="mt-5 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ?
            "Finding matches…"
          : error ?
            "Retry matching"
          : "Find my matches"}
        </button>
        {error && (
          <p
            role="alert"
            className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {error}
          </p>
        )}
        <p role="status" className="text-pretty mt-4 text-sm text-slate-600">
          {loading ?
            "Comparing your profile with available projects…"
          : result ?
            result.matches.length ?
              `${result.matches.length} ${result.mode === "ai" ? "AI" : "rule-based"} recommendation${result.matches.length === 1 ? "" : "s"}.`
            : "No matches found. Try updating your skills, interests, or available hours."

          : !problem && projects.length ?
            "Find matches for your current saved profile. Results clear when your profile or projects change."
          : ""}
        </p>
        {result && (
          <ul className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {result.matches.map((match) => (
              <li
                key={match.projectId}
                className="flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <h3 className="text-lg font-bold text-slate-900">
                  {
                    projects.find((project) => project.id === match.projectId)!
                      .title
                  }
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {match.reason}
                </p>
                <button
                  type="button"
                  className="mt-auto pt-5 text-left text-sm font-semibold text-indigo-600 transition hover:text-indigo-800 focus:outline-none focus:underline"
                  onClick={() => router.push(`/projects/${encodeURIComponent(match.projectId)}`)}
                >
                  View project
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
