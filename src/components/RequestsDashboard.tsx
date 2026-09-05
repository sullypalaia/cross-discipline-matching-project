"use client";

import { useState } from "react";

export type JoinRequest = { id: string; projectId: string; applicantName: string; why: string; help: string; hoursPerWeek: number; modality: "in-person" | "online"; status: "pending" | "accepted" | "declined"; rejectionMessage?: string };

const defaultRejection = "Unfortunately the requirements and scope of this project do not fit your stated interests and skills, but there are many other projects that can be a great experience for you.";

export default function RequestsDashboard({ requests, onUpdate }: { requests: JoinRequest[]; onUpdate?: (request: JoinRequest) => void }) {
  const [rejecting, setRejecting] = useState<string | null>(null); const [message, setMessage] = useState(defaultRejection);
  function resolve(request: JoinRequest, status: "accepted" | "declined") { const updated = { ...request, status, ...(status === "declined" ? { rejectionMessage: message } : {}) }; onUpdate?.(updated); setRejecting(null); }
  return <section className="space-y-4">{requests.map((request) => <article key={request.id} className="rounded-2xl border border-slate-200 bg-white p-5"><div className="flex items-start justify-between gap-4"><div><h3 className="font-bold text-slate-950">{request.applicantName}</h3><p className="mt-1 text-sm text-slate-500">{request.hoursPerWeek} hrs/week · {request.modality}</p></div><span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">{request.status}</span></div><p className="mt-4 text-sm text-slate-700"><b>Why:</b> {request.why}</p><p className="mt-2 text-sm text-slate-700"><b>Can help with:</b> {request.help}</p>{request.status === "pending" && <div className="mt-4 flex gap-3"><button onClick={() => resolve(request, "accepted")} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Accept</button><button onClick={() => setRejecting(request.id)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700">Decline</button></div>}{rejecting === request.id && <div className="mt-4 rounded-xl bg-slate-50 p-4"><label className="text-sm font-semibold text-slate-700">Message to applicant<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="mt-2 w-full rounded-xl border border-slate-200 p-3 text-sm" /></label><button onClick={() => resolve(request, "declined")} className="mt-3 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Send decline</button></div>}</article>)}</section>;
}
