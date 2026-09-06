"use client";

import { useEffect, useRef, useState } from "react";
import { skillRules } from "@/lib/ai/skillRules";

type Props = { title: string; description: string; selected: string; onAdd: (skill: string) => void };

export default function SkillSuggestions({ title, description, selected, onAdd }: Props) {
  const [skills, setSkills] = useState<string[] | null>(null);
  const [mode, setMode] = useState<"ai" | "manual">("manual");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  async function suggest() {
    if (active.current) return;
    setError("");
    setSkills(null);
    if (!`${title}${description}`.trim()) {
      setError("Enter a project name or description first."); return;
    }
    const controller = new AbortController();
    active.current = controller;
    const timeout = setTimeout(() => controller.abort(), 20000);
    setLoading(true);
    try {
      const response = await fetch("/api/suggest-skills", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }), signal: controller.signal,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(typeof data.error === "string" ? data.error : "Try again or enter skills manually.");
      if (!["ai", "manual"].includes(data.mode) || !Array.isArray(data.skills) || !data.skills.every((skill: unknown) => typeof skill === "string")) throw new Error("Invalid suggestions. Please try again.");
      setSkills(data.skills);
      setMode(data.mode);
    } catch {
      setSkills(skillRules(title, description));
      setMode("manual");
    } finally {
      clearTimeout(timeout); active.current = null; setLoading(false);
    }
  }

  const added = new Set(selected.split(",").map((skill) => skill.trim().toLowerCase()));
  return <div className="min-w-0 flex-1">
    <button type="button" onClick={suggest} disabled={loading}
      className="w-full rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-60">
      {loading ? "Suggesting…" : "Suggest skills"}
    </button>
    <p className="mt-2 text-xs text-slate-500">Uses your project details with AI when available, or built-in suggestions.</p>
    {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
    {skills && <div className="mt-3">
      <p role="status" className="text-xs text-slate-600">{mode === "ai" ? "AI-generated skill suggestions." : "Built-in skill suggestions — no AI was used to generate these results."} {skills.length ? "Click a skill to add it to Looking for." : "Add more project details and try again."}</p>
      <div className="mt-2 flex flex-wrap gap-2">{skills.map((skill) => <button key={skill} type="button"
        disabled={added.has(skill.toLowerCase())} onClick={() => onAdd(skill)}
        className="rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-900 hover:bg-emerald-100 disabled:opacity-60">
        {added.has(skill.toLowerCase()) ? "✓ " : "+ "}{skill}
      </button>)}</div>
    </div>}
  </div>;
}
