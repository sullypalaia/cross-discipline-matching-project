"use client";

import { useEffect, useRef, useState } from "react";
import type { MatchResponse, Profile, Project } from "@/app/types/matching";
import { requestError } from "@/lib/ai/validation";

type Props = {
  // TODO(team integration): Student 1 passes the saved Profile (or null) and
  // current available Project[] from shared storage; Student 2 supplies the fields.
  profile: Profile | null;
  projects: Project[];
  // TODO(team integration): Student 1 connects this ID to Student 3's detail
  // view, e.g. selectProject("solar-car"). No assumed URL or router is used here.
  onSelectProject: (projectId: string) => void;
};

export default function ProjectMatcher(props: Props) {
  // Any changed input remounts the session, hiding stale results immediately and
  // aborting the old request. Equal data in a new array does not clear results.
  return <MatchingSession key={JSON.stringify([props.profile, props.projects])} {...props} />;
}

function MatchingSession({ profile, projects, onSelectProject }: Props) {
  const [result, setResult] = useState<MatchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  const problem = requestError({ profile, projects });

  useEffect(() => () => { active.current?.abort(); }, []);

  async function findMatches() {
    if (active.current || problem || projects.length === 0) return;
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 15000);
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
      if (data?.mode !== "sample" || !Array.isArray(data.matches) || data.matches.length > 3 ||
          !data.matches.every((match: { projectId?: unknown; reason?: unknown } | null) => {
            if (!match || typeof match.projectId !== "string" || !ids.has(match.projectId) ||
                seen.has(match.projectId) || typeof match.reason !== "string" || !match.reason.trim()) return false;
            seen.add(match.projectId);
            return true;
          })) throw new Error("Invalid response");
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
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-700" aria-busy={loading}>
      <h2 className="text-2xl font-semibold">Projects for you</h2>
      <p className="mt-2 text-sm">Sample matching — skill and interest rules, not a live AI model. Projects must fit your weekly hours.</p>
      {problem && <p className="mt-4" role="status">{problem}</p>}
      {!projects.length && <p className="mt-4">No projects are available yet. Check back after students post projects.</p>}
      <button type="button" onClick={findMatches} disabled={loading || !!problem || !projects.length}
        className="mt-5 rounded-full bg-foreground px-5 py-3 text-background disabled:opacity-50">
        {loading ? "Finding matches…" : error ? "Retry matching" : "Find my matches"}
      </button>
      {error && <p role="alert" className="mt-4 text-red-700 dark:text-red-400">{error}</p>}
      <p role="status" className="mt-4">
        {loading ? "Comparing your profile with available projects…" : result ?
          result.matches.length ? `${result.matches.length} sample recommendation${result.matches.length === 1 ? "" : "s"}.` :
            "No matches found. Try updating your skills, interests, or available hours." :
          !problem && projects.length ? "Find matches for your current saved profile. Results clear when your profile or projects change." : ""}
      </p>
      {result && <ul className="mt-4 space-y-4">
        {result.matches.map((match) => (
          <li key={match.projectId} className="rounded-xl border border-zinc-300 p-4 dark:border-zinc-700">
            <h3 className="text-lg font-semibold">{projects.find((project) => project.id === match.projectId)!.title}</h3>
            <p className="mt-2">{match.reason}</p>
            <button type="button" className="mt-3 rounded-full border border-zinc-400 px-4 py-2"
              onClick={() => onSelectProject(match.projectId)}>View project</button>
          </li>
        ))}
      </ul>}
    </section>
  );
}
