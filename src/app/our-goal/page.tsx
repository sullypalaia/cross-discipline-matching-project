"use client";

import Link from "next/link";
import CreateProject from "@/components/CreateProject";

const campusImage =
  "https://www.calpoly.edu/sites/default/files/2022-12/20220422-DesignVillage-JoeJ0055.jpg";

export default function OurGoal() {
  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
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
              My profile
            </Link>
          </nav>
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
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-24">
        <div className="mb-12 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600">
            Why Crosspaths exists
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-slate-950 sm:text-6xl">
            Our Goal
          </h1>
        </div>

        <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-16">
          <div className="max-w-xl">
            <p className="text-xl leading-9 text-slate-600 sm:text-2xl sm:leading-10">
              Our goal is to help Cal Poly students find meaningful
              collaborations beyond the boundaries of their major. Crosspaths
              brings different skills, ideas, and perspectives together so
              students can turn curious questions into hands-on projects. By
              making it easier to discover the right people, we hope to build a
              more connected campus where everyone has a chance to learn by
              doing.
            </p>
          </div>

          <div>
            <div
              className="group overflow-hidden rounded-[2rem] border-8 border-white bg-slate-200 shadow-2xl shadow-indigo-950/15 transition duration-500 ease-out hover:scale-[1.03] hover:border-indigo-100 hover:shadow-indigo-950/25"
              role="img"
              aria-label="A scenic view of Cal Poly's campus"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center transition duration-700 ease-out group-hover:scale-105"
                style={{ backgroundImage: `url("${campusImage}")` }}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
