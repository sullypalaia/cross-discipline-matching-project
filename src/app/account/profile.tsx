"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/utils/supabase/clients";

type Profile = { display_name: string | null; bio: string | null; disciplines: string[] | null; skills: string[] | null; interests: string[] | null; hours_per_week: number | null } | null;
type Props = { email: string; userId: string; initialProfile: Profile };
const toList = (value: string) => Array.from(new Set(value.split(",").map((item) => item.trim()).filter(Boolean)));

export default function AccountProfile({ email, userId, initialProfile }: Props) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [disciplines, setDisciplines] = useState(initialProfile?.disciplines?.join(", ") ?? "");
  const [skills, setSkills] = useState(initialProfile?.skills?.join(", ") ?? "");
  const [interests, setInterests] = useState(initialProfile?.interests?.join(", ") ?? "");
  const [hours, setHours] = useState(initialProfile?.hours_per_week?.toString() ?? "");
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setError(""); setStatus("");
    const weeklyHours = hours ? Number(hours) : null;
    if (weeklyHours !== null && (!Number.isFinite(weeklyHours) || weeklyHours < 0 || weeklyHours > 80)) {
      setSaving(false); setError("Weekly availability must be between 0 and 80 hours."); return;
    }
    const { error: saveError } = await createClient().from("profiles").upsert({ id: userId, display_name: displayName.trim() || null, bio: bio.trim() || null, disciplines: toList(disciplines), skills: toList(skills), interests: toList(interests), hours_per_week: weeklyHours, updated_at: new Date().toISOString() });
    setSaving(false);
    if (saveError) { setError(saveError.message); return; }
    setStatus("Your profile has been saved."); router.refresh();
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/"); router.refresh();
  }

  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={displayName.trim() || email} />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-9">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start"><div><p className="text-sm font-semibold text-indigo-600">Your account</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Build your collaborator profile</h1><p className="mt-3 text-sm leading-6 text-slate-600">Your account uses <span className="font-medium text-slate-800">{email}</span>. Add what you enjoy and what you bring to a project.</p></div><button type="button" onClick={signOut} className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300">Sign out</button></div>
          <form onSubmit={saveProfile} className="mt-8 space-y-6"><label className="block text-sm font-semibold text-slate-800">Name<input value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={80} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="How collaborators should know you" /></label><label className="block text-sm font-semibold text-slate-800">About you<textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={600} rows={4} className="mt-2 w-full resize-y rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="What kinds of projects excite you?" /></label><div className="grid gap-6 sm:grid-cols-2"><label className="block text-sm font-semibold text-slate-800">Disciplines<input value={disciplines} onChange={(event) => setDisciplines(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="Design, biology" /></label><label className="block text-sm font-semibold text-slate-800">Skills<input value={skills} onChange={(event) => setSkills(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="Research, Figma" /></label><label className="block text-sm font-semibold text-slate-800">Interests<input value={interests} onChange={(event) => setInterests(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="Accessibility, music" /></label><label className="block text-sm font-semibold text-slate-800">Hours available each week<input type="number" min="0" max="80" step="0.5" value={hours} onChange={(event) => setHours(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" placeholder="5" /></label></div><p className="text-xs text-slate-500">Separate items with commas. Your profile is visible only to you until project/profile discovery is added.</p><button disabled={saving} type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{saving ? "Saving…" : "Save profile"}</button>{status && <p role="status" className="text-sm font-medium text-emerald-700">{status}</p>}{error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}</form>
        </section>
      </div>
    </main>
  );
}
