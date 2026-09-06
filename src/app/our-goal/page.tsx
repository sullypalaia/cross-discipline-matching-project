import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import OurGoalHeader from "./OurGoalHeader";

const campusImage =
  "https://www.calpoly.edu/sites/default/files/2022-12/20220422-DesignVillage-JoeJ0055.jpg";

export default async function OurGoal() {
  const supabase = createClient(await cookies());
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let accountLabel: string | null = null;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("display_name")
      .eq("id", user.id)
      .maybeSingle();

    accountLabel = profile?.display_name?.trim() || user.email || "Account";
  }

  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <OurGoalHeader accountLabel={accountLabel} />

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
