"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function JoinRequestActions({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isAccepting, setIsAccepting] = useState(false);
  const [error, setError] = useState("");

  async function acceptRequest() {
    setIsAccepting(true);
    setError("");
    const response = await fetch(`/api/join-requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "approved" }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      setError(body?.error || "Unable to accept this request.");
      setIsAccepting(false);
      return;
    }

    router.refresh();
  }

  return (
    <div className="mt-5">
      <button
        type="button"
        onClick={acceptRequest}
        disabled={isAccepting}
        className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-wait disabled:opacity-60"
      >
        {isAccepting ? "Accepting..." : "Accept request"}
      </button>
      {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
    </div>
  );
}
