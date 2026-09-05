"use client";

import { FormEvent, useState } from "react";
import type { Project } from "./ProjectCard";

type JoinRequestFormProps = { project: Project; accountName?: string; onClose: () => void; onSubmitted?: () => void };

export default function JoinRequestForm({ project, accountName = "Alex Morgan", onClose, onSubmitted }: JoinRequestFormProps) {
  const [name, setName] = useState(accountName);
  const [why, setWhy] = useState("");
  const [help, setHelp] = useState("");
  const [hours, setHours] = useState("");
  const [modality, setModality] = useState<"in-person" | "online">("online");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    const commitment = Number(hours);
    if (!Number.isFinite(commitment) || commitment <= 0) { setError("Please enter a positive number of hours."); return; }
    setError("");
    await fetch(`/api/projects/${project.id}/join-requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name, why, help, hoursPerWeek: commitment, modality }) });
    setSent(true); onSubmitted?.();
  }

  return <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/50 p-4 sm:p-8" role="dialog" aria-modal="true" aria-labelledby="join-request-heading">
    <div className="mx-auto max-w-3xl rounded-3xl bg-white shadow-2xl">
      <div className="flex items-start justify-between border-b border-slate-100 px-6 py-5"><div><p className="text-sm font-semibold text-indigo-600">Join a project</p><h2 id="join-request-heading" className="mt-1 text-2xl font-bold text-slate-950">{project.title}</h2></div><button type="button" onClick={onClose} className="rounded-lg px-2 text-2xl text-slate-400 hover:bg-slate-100" aria-label="Close">×</button></div>
      {sent ? <div className="px-6 py-12 text-center"><div className="mx-auto grid size-14 place-items-center rounded-full bg-emerald-100 text-2xl text-emerald-700">✓</div><h3 className="mt-4 text-xl font-bold text-slate-950">Request sent</h3><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">{project.owner} has been notified and can accept or decline your request from their project dashboard.</p><button type="button" onClick={onClose} className="mt-6 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">Done</button></div> : <form onSubmit={submit} className="space-y-6 px-6 py-6">
        <div className="rounded-2xl bg-slate-50 p-5"><div className="flex flex-wrap gap-2">{project.disciplines.map((tag) => <span key={tag} className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700">{tag}</span>)}</div><p className="mt-4 text-sm leading-6 text-slate-600">{project.description}</p><p className="mt-3 text-sm font-semibold text-slate-800">Created by {project.owner}</p><div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3"><span><b className="block text-lg text-slate-950">{project.members}</b>current members</span><span><b className="block text-lg text-slate-950">{project.lookingFor.length}</b>open roles</span><span><b className="block text-lg text-slate-950">{project.commitment}</b>expected time</span></div><p className="mt-4 text-sm text-slate-700"><b>Subjects and skills:</b> {project.disciplines.concat(project.lookingFor).join(", ")}</p></div>
        <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold text-slate-700">Your name<input required value={name} onChange={(e) => setName(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label><label className="text-sm font-semibold text-slate-700">Available commitment (Hours per week)<input required type="number" min="0.1" step="0.1" value={hours} onChange={(e) => setHours(e.target.value)} placeholder="e.g. 4" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label></div>
        <label className="block text-sm font-semibold text-slate-700">Why do you want to join?<textarea required rows={3} value={why} onChange={(e) => setWhy(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label><label className="block text-sm font-semibold text-slate-700">What can you help with?<textarea required rows={3} value={help} onChange={(e) => setHelp(e.target.value)} className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-normal outline-none focus:border-indigo-500" /></label>
        <fieldset><legend className="text-sm font-semibold text-slate-700">Preferred meeting modality</legend><div className="mt-2 flex gap-5"><label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" checked={modality === "in-person"} onChange={() => setModality("in-person")} /> In-person</label><label className="flex items-center gap-2 text-sm text-slate-600"><input type="radio" checked={modality === "online"} onChange={() => setModality("online")} /> Online</label></div></fieldset>
        {error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm font-semibold text-slate-600">Cancel</button><button type="submit" className="rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700">Send request</button></div>
      </form>}
    </div>
  </div>;
}
