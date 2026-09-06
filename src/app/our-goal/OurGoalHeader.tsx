"use client";

import Link from "next/link";
import CreateProject from "@/components/CreateProject";

type OurGoalHeaderProps = {
  accountLabel: string | null;
};

export default function OurGoalHeader({ accountLabel }: OurGoalHeaderProps) {
  return (
    <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950"
        >
          <span
            className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white"
            aria-hidden="true"
          >
            ✦
          </span>
          Crosspaths
        </Link>
        <nav
          className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex"
          aria-label="Main navigation"
        >
          <Link href="/" className="transition hover:text-slate-950">
            Explore
          </Link>
          <Link href="/our-goal" className="text-indigo-600">
            Our goal
          </Link>
          <Link href="/#profile" className="transition hover:text-slate-950">
            Find matches
          </Link>
          <Link href="/account" className="transition hover:text-slate-950">
            My profile
          </Link>
        </nav>
        <div className="flex items-center gap-3">
          <CreateProject
            renderTrigger={(onClick) => (
              <button
                type="button"
                onClick={onClick}
                className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-600"
              >
                Post a project
              </button>
            )}
          />
          <Link
            href={accountLabel ? "/account" : "/login"}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 transition hover:text-slate-950"
          >
            {accountLabel && (
              <span
                className="size-2 rounded-full bg-emerald-500"
                aria-hidden="true"
              />
            )}
            {accountLabel ?? "Login"}
          </Link>
        </div>
      </div>
    </header>
  );
}
