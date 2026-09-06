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
    <main id="main-content" className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <OurGoalHeader accountLabel={accountLabel} />
      <div className="relative min-h-64 overflow-hidden bg-slate-950 text-white sm:min-h-80">
        <img
          src={campusImage}
          alt="A scenic view of Cal Poly's campus"
          className="absolute inset-0 size-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-slate-950/60" aria-hidden="true" />
        <div className="relative z-10 mx-auto flex min-h-64 max-w-7xl flex-col justify-center px-5 py-8 sm:min-h-80 sm:px-8">
          <p className="text-sm font-semibold text-indigo-200">
            Why Crosspaths exists
          </p>
          <h1 className="mt-2 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
            Our goal
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-100 sm:text-base">
            Building a more connected campus, one unlikely collaboration at a
            time.
          </p>
        </div>
      </div>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="max-w-3xl rounded-3xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
          <p className="text-lg leading-9 text-slate-600 sm:text-xl sm:leading-10">
            Our goal is to help Cal Poly students find meaningful collaborations
            beyond the boundaries of their major. Crosspaths brings different
            skills, ideas, and perspectives together so students can turn
            curious questions into hands-on projects. By making it easier to
            discover the right people, we hope to build a more connected campus
            where everyone has a chance to learn by doing.
          </p>
        </div>
      </section>
    </main>
  );
}
