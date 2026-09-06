"use client";

import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import {
  FACULTY_CATALOG_URL,
  type FacultyResponse,
} from "@/lib/faculty/directory";

export default function FacultyFinder() {
  const id = useId();
  const [query, setQuery] = useState("");
  const [state, setState] = useState<{
    query: string;
    result?: FacultyResponse;
    error?: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  const visible = state?.query === query ? state : null;
  useEffect(() => () => active.current?.abort(), []);

  async function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (active.current || query.trim().length < 2) return;
    const controller = new AbortController();
    active.current = controller;
    setLoading(true);
    setState(null);
    const timeout = setTimeout(() => controller.abort(), 85000);
    try {
      const response = await fetch("/api/faculty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });
      if (!response.ok) throw new Error("Faculty search unavailable");
      const result: FacultyResponse = await response.json();
      setState({ query, result });
    } catch {
      setState({
        query,
        error:
          "Could not load faculty suggestions. Try again or browse Cal Poly’s directory below.",
      });
    } finally {
      clearTimeout(timeout);
      active.current = null;
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-linear-to-br from-violet-50 via-white to-white px-6 py-7 sm:px-8">
        <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
          Find Cal Poly faculty
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Describe any project area. AI searches official Cal Poly pages across
          departments, reads published faculty information, and ranks relevant
          people. Suggestions do not imply availability or an agreement to
          advise.
        </p>
      </div>
      <div className="space-y-5 px-6 py-6 sm:px-8">
        <p className="text-sm leading-6 text-slate-500">
          Your topic is sent to OpenAI for web search and ranking. Research may
          take up to a minute. Without AI, we search department listings in the
          broader faculty catalog.
        </p>
        <form
          onSubmit={search}
          className="space-y-3 rounded-2xl bg-slate-50 p-4 sm:p-5"
        >
          <label htmlFor={id} className="block font-medium">
            Project topic or area
          </label>
          <input
            id={id}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setState(null);
            }}
            required
            minLength={2}
            maxLength={500}
            placeholder="e.g. sustainability, cybersecurity, music"
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          />
          <button
            disabled={loading || query.trim().length < 2}
            className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ?
              "Researching Cal Poly faculty…"
            : visible?.error ?
              "Retry faculty search"
            : "Find faculty"}
          </button>
        </form>
        {visible?.error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800"
          >
            {visible.error}
          </p>
        )}
        {visible?.result && (
          <p role="status" className="text-sm font-semibold text-slate-700">
            {visible.result.mode === "ai" ?
              "Live web research + AI ranking · official Cal Poly sources"
            : visible.result.fallbackReason === "ai_unavailable" ?
              "Live AI search unavailable · showing catalog/topic matches instead"
            : "Topic-based faculty suggestions · no AI used"}
          </p>
        )}
        <p role="status" className="text-sm text-slate-600">
          {loading ?
            "Finding relevant departments, researching faculty pages, and ranking results…"
          : visible?.result ?
            visible.result.faculty.length ?
              "Related faculty with official sources:"
            : "This search found no supported suggestions. That does not mean no relevant faculty exist; try different terms or browse the catalog."

          : ""}
        </p>
        {visible?.result && (
          <ul className="grid gap-4 md:grid-cols-2">
            {visible.result.faculty.map((person, index) => (
              <li
                key={`${person.url}:${person.name}`}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <p className="text-sm font-bold text-indigo-600">
                  {visible.result!.mode === "ai" ?
                    `AI rank #${index + 1}`
                  : `Topic suggestion #${index + 1}`}
                </p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">
                  {person.name}
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {person.evidence === "department" ?
                    "Department"
                  : "Published expertise"}
                  : {person.expertise.join("; ")}
                </p>
                {person.evidence === "department" && (
                  <p className="text-sm text-amber-700">
                    Department affiliation only — specific research expertise
                    has not been verified.
                  </p>
                )}
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  {visible.result!.mode === "ai" ?
                    "Why AI ranked this faculty member"
                  : "Why this topic matched"}
                </p>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {person.reason}
                </p>
                <a
                  href={person.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-medium text-indigo-600 underline"
                >
                  View official faculty profile
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm leading-6 text-slate-500">
          Search covers official Cal Poly domains, not just a preset list of
          majors. Web coverage is not exhaustive; catalog fallback may be cached
          for one hour. Verify AI interpretations on the linked sources.
        </p>
        <a
          href={FACULTY_CATALOG_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-indigo-600 underline"
        >
          Browse Cal Poly’s faculty catalog
        </a>
      </div>
    </section>
  );
}
