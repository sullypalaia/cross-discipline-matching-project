"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinRequestActions({ projectId, requestId }: { projectId: number | string; requestId: number | string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function accept() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/join-requests/${encodeURIComponent(requestId)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "accepted" }) });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error ?? "Unable to accept this request.");
      router.refresh();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to accept this request.");
    } finally {
      setBusy(false);
    }
  }

  return <div className="mt-4"><button type="button" onClick={accept} disabled={busy} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60">{busy ? "Accepting…" : "Accept"}</button>{error && <p role="alert" className="mt-2 text-xs text-rose-700">{error}</p>}</div>;
}
