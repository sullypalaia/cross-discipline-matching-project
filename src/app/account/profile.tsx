"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import SiteHeader from "@/components/SiteHeader";
import { createClient } from "@/utils/supabase/clients";

type Profile = {
  display_name: string | null;
  bio: string | null;
  disciplines: string[] | null;
  skills: string[] | null;
  interests: string[] | null;
  hours_per_week: number | null;
} | null;
type Field =
  | "display_name"
  | "bio"
  | "disciplines"
  | "skills"
  | "interests"
  | "hours_per_week";
type Props = { email: string; userId: string; initialProfile: Profile };

const toList = (value: string) =>
  Array.from(
    new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  );
const labels: Record<Field, string> = {
  display_name: "Name",
  bio: "About you",
  disciplines: "Disciplines",
  skills: "Skills",
  interests: "Interests",
  hours_per_week: "Hours available",
};

type AttributeProps = {
  field: Field;
  value: string;
  editing: boolean;
  saving: boolean;
  error: string;
  multiline?: boolean;
  numeric?: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (value: string) => Promise<void>;
};

function ProfileAttribute({
  field,
  value,
  editing,
  saving,
  error,
  multiline = false,
  numeric = false,
  onEdit,
  onCancel,
  onSave,
}: AttributeProps) {
  const [draft, setDraft] = useState(value);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await onSave(draft);
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 sm:px-6">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-slate-500">
            {labels[field]}
          </h2>
          {!editing && (
            <p className="mt-1 whitespace-pre-wrap text-base leading-6 text-slate-900">
              {value || "Not added yet"}
            </p>
          )}
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(value);
              onEdit();
            }}
            aria-label={`Edit ${labels[field]}`}
            className="grid size-9 shrink-0 place-items-center rounded-lg text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.86 3.49 3.65 3.65M4 20l3.8-.76L20.51 6.53a2.58 2.58 0 0 0-3.65-3.65L4.15 15.59 4 20Z"
              />
            </svg>
          </button>
        )}
      </div>
      {editing && (
        <form onSubmit={submit} className="mt-4">
          <label className="sr-only" htmlFor={`edit-${field}`}>
            {labels[field]}
          </label>
          {multiline ?
            <textarea
              id={`edit-${field}`}
              autoFocus
              rows={4}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              maxLength={600}
              className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          : <input
              id={`edit-${field}`}
              autoFocus
              type={numeric ? "number" : "text"}
              min={numeric ? "0" : undefined}
              max={numeric ? "80" : undefined}
              step={numeric ? "0.5" : undefined}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-950 outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10"
            />
          }
          {["disciplines", "skills", "interests"].includes(field) && (
            <p className="mt-2 text-xs text-slate-500">
              Separate items with commas.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-3 text-sm text-rose-700">
              {error}
            </p>
          )}
          <div className="mt-4 flex gap-3">
            <button
              disabled={saving}
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              disabled={saving}
              type="button"
              onClick={onCancel}
              className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

export default function AccountProfile({
  email,
  userId,
  initialProfile,
}: Props) {
  const router = useRouter();
  const [profile, setProfile] = useState({
    display_name: initialProfile?.display_name ?? "",
    bio: initialProfile?.bio ?? "",
    disciplines: initialProfile?.disciplines ?? [],
    skills: initialProfile?.skills ?? [],
    interests: initialProfile?.interests ?? [],
    hours_per_week: initialProfile?.hours_per_week,
  });
  const [editing, setEditing] = useState<Field | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  async function saveField(field: Field, draft: string) {
    setSaving(true);
    setError("");
    setStatus("");
    let value: string | string[] | number | null = draft.trim() || null;
    if (field === "disciplines" || field === "skills" || field === "interests")
      value = toList(draft);
    if (field === "hours_per_week") {
      value = draft.trim() ? Number(draft) : null;
      if (
        value !== null &&
        (!Number.isFinite(value) || value < 0 || value > 80)
      ) {
        setSaving(false);
        setError("Hours must be between 0 and 80.");
        return;
      }
    }
    const { error: saveError } = await createClient()
      .from("profiles")
      .upsert({
        id: userId,
        [field]: value,
        updated_at: new Date().toISOString(),
      });
    setSaving(false);
    if (saveError) {
      setError(saveError.message);
      return;
    }
    setProfile((current) => ({ ...current, [field]: value }));
    setEditing(null);
    setStatus(`${labels[field]} saved.`);
    router.refresh();
  }

  async function signOut() {
    await createClient().auth.signOut();
    router.replace("/");
    router.refresh();
  }
  const values: Record<Field, string> = {
    display_name: profile.display_name,
    bio: profile.bio,
    disciplines: profile.disciplines.join(", "),
    skills: profile.skills.join(", "),
    interests: profile.interests.join(", "),
    hours_per_week: profile.hours_per_week?.toString() ?? "",
  };

  return (
    <main className="min-h-screen bg-[#f8f8fc] text-slate-900">
      <SiteHeader accountLabel={profile.display_name.trim() || email} />
      <div className="mx-auto max-w-3xl px-5 py-10 sm:px-8 sm:py-14">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div>
            <p className="text-sm font-semibold text-indigo-600">Account</p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
              Your profile
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              The email associated with your account is{" "}
              <span className="font-medium text-slate-800">{email}</span>.
            </p>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="shrink-0 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:border-slate-300"
          >
            Sign out
          </button>
        </div>
        <div className="mt-8 space-y-4">
          <ProfileAttribute
            field="display_name"
            value={values.display_name}
            editing={editing === "display_name"}
            saving={saving}
            error={error}
            onEdit={() => {
              setEditing("display_name");
              setError("");
            }}
            onCancel={() => setEditing(null)}
            onSave={(value) => saveField("display_name", value)}
          />
          <ProfileAttribute
            field="bio"
            value={values.bio}
            editing={editing === "bio"}
            saving={saving}
            error={error}
            multiline
            onEdit={() => {
              setEditing("bio");
              setError("");
            }}
            onCancel={() => setEditing(null)}
            onSave={(value) => saveField("bio", value)}
          />
          <ProfileAttribute
            field="disciplines"
            value={values.disciplines}
            editing={editing === "disciplines"}
            saving={saving}
            error={error}
            onEdit={() => {
              setEditing("disciplines");
              setError("");
            }}
            onCancel={() => setEditing(null)}
            onSave={(value) => saveField("disciplines", value)}
          />
          <ProfileAttribute
            field="skills"
            value={values.skills}
            editing={editing === "skills"}
            saving={saving}
            error={error}
            onEdit={() => {
              setEditing("skills");
              setError("");
            }}
            onCancel={() => setEditing(null)}
            onSave={(value) => saveField("skills", value)}
          />
          <ProfileAttribute
            field="interests"
            value={values.interests}
            editing={editing === "interests"}
            saving={saving}
            error={error}
            onEdit={() => {
              setEditing("interests");
              setError("");
            }}
            onCancel={() => setEditing(null)}
            onSave={(value) => saveField("interests", value)}
          />
          <ProfileAttribute
            field="hours_per_week"
            value={values.hours_per_week}
            editing={editing === "hours_per_week"}
            saving={saving}
            error={error}
            numeric
            onEdit={() => {
              setEditing("hours_per_week");
              setError("");
            }}
            onCancel={() => setEditing(null)}
            onSave={(value) => saveField("hours_per_week", value)}
          />
        </div>
        {status && (
          <p
            role="status"
            className="mt-5 text-sm font-semibold text-emerald-700"
          >
            {status}
          </p>
        )}
      </div>
    </main>
  );
}
