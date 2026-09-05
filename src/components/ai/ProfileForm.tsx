"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import type { Profile } from "@/app/types/matching";
import { MAX_HOURS, profileError, profileFromForm } from "@/lib/ai/validation";

type Props = {
  // KEEP: Student 4's reusable form. Student 1 wires these props in the parent;
  // remove the integration TODOs after wiring, not the form or its validation.
  // TODO(team integration): Student 1 supplies the current saved Profile or null.
  // After onSave succeeds, update this prop so matching uses the edited profile.
  initialProfile?: Profile | null;
  // TODO(team integration): Student 1 supplies shared storage's save callback.
  // Receive a Profile; return only after saving, or reject/throw on failure.
  onSave: (profile: Profile) => void | Promise<void>;
};

export default function ProfileForm(props: Props) {
  // Reset form state when a different saved profile arrives, including async loads.
  return <ProfileEditor key={JSON.stringify(props.initialProfile ?? null)} {...props} />;
}

function ProfileEditor({ initialProfile, onSave }: Props) {
  const id = useId();
  const [skills, setSkills] = useState(initialProfile?.skills.join(", ") ?? "");
  const [interests, setInterests] = useState(initialProfile?.interests.join(", ") ?? "");
  const [hours, setHours] = useState(initialProfile?.hoursPerWeek.toString() ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const busy = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current) return;
    const profile = profileFromForm(skills, interests, hours);
    const problem = profileError(profile);
    setError(problem);
    setSaved(false);
    if (problem) return;
    busy.current = true;
    setSaving(true);
    try {
      await onSave(profile);
      setSaved(true);
    } catch {
      setError("Could not save your profile. Please try again.");
    } finally {
      busy.current = false;
      setSaving(false);
    }
  }

  const inputStyle = "mt-2 w-full rounded-lg border border-zinc-400 bg-transparent p-3";
  return (
    <section className="rounded-2xl border border-zinc-300 p-6 dark:border-zinc-700">
      <h2 className="text-2xl font-semibold">Your profile</h2>
      <p className="mt-2 text-sm">Tell teammates what you bring and what you want to work on.</p>
      <form onSubmit={submit} onChange={() => { setSaved(false); setError(null); }} className="mt-6 space-y-4">
        <fieldset disabled={saving} className="space-y-4">
          <div>
            <label htmlFor={`${id}-skills`}>Skills</label>
            <input id={`${id}-skills`} className={inputStyle} required maxLength={2430}
              value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="React, design, writing"
              aria-describedby={`${id}-tags`} />
          </div>
          <div>
            <label htmlFor={`${id}-interests`}>Interests</label>
            <input id={`${id}-interests`} className={inputStyle} required maxLength={2430}
              value={interests} onChange={(e) => setInterests(e.target.value)} placeholder="Sustainability, robotics"
              aria-describedby={`${id}-tags`} />
          </div>
          <p id={`${id}-tags`} className="text-sm">Separate entries with commas. Add 1–30 per field, up to 80 characters each.</p>
          <div>
            <label htmlFor={`${id}-hours`}>Hours available per week</label>
            <input id={`${id}-hours`} className={inputStyle} type="number" required min="0.1" max={MAX_HOURS} step="any"
              value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <button type="submit" className="rounded-full bg-foreground px-5 py-3 text-background disabled:opacity-50">
            {saving ? "Saving…" : "Save profile"}
          </button>
        </fieldset>
        {error && <p role="alert" className="text-red-700 dark:text-red-400">{error}</p>}
        <p role="status">{saved ? "Profile saved." : saving ? "Saving your profile…" : ""}</p>
      </form>
    </section>
  );
}
