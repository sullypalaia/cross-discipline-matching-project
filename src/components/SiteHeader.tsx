"use client";

import Link from "next/link";
import CreateProject from "./CreateProject";

type SiteHeaderProps = { accountLabel: string | null };

export default function SiteHeader({ accountLabel }: SiteHeaderProps) {
  const initial = accountLabel?.trim().charAt(0).toUpperCase() || "→";

  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-bold tracking-tight text-slate-950">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white" aria-hidden="true">✦</span>
          Crosspaths
        </Link>
        <nav className="order-last flex w-full items-center gap-7 text-sm font-medium text-slate-600 md:order-none md:w-auto" aria-label="Main navigation">
          <Link href="/dashboard" className="transition hover:text-slate-950">Dashboard</Link>
          <Link href="/" className="transition hover:text-slate-950">Explore</Link>
          <Link href="/our-goal" className="transition hover:text-slate-950">Our goal</Link>
          <Link href="/matches" className="transition hover:text-slate-950">Find matches</Link>
        </nav>
        <div className="flex items-center gap-3">
          <CreateProject
            renderTrigger={(onClick) => (
              <button type="button" onClick={onClick} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600">
                <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="size-4"><path strokeLinecap="round" d="M12 5v14M5 12h14" /></svg>
                <span className="hidden sm:inline">Post a project</span>
                <span className="sm:hidden">Post</span>
              </button>
            )}
          />
          <Link href={accountLabel ? "/account" : "/login"} title={accountLabel ? "Open account" : "Sign in"} aria-label={accountLabel ? "Open account" : "Sign in"} className="grid size-10 place-items-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 transition hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
            {initial}
          </Link>
        </div>
      </div>
    </header>
  );
}
