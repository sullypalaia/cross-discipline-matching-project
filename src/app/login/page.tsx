"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createClient } from "@/utils/supabase/clients";

type Step = "email" | "code";

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: signInError } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    setLoading(false);
    if (signInError) {
      setError(signInError.message);
      return;
    }

    setStep("code");
    setMessage(`We sent a sign-in code to ${email.trim()}.`);
  }

  async function verifyCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: verifyError } = await createClient().auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: "email",
    });

    setLoading(false);
    if (verifyError) {
      setError("That code is invalid or has expired. Request a new code and try again.");
      return;
    }

    // Only allow this known destination; never redirect to arbitrary query URLs.
    const returnToMatches = new URLSearchParams(window.location.search).get("next") === "matches";
    router.replace(returnToMatches ? "/matches" : "/account");
    router.refresh();
  }

  return (
    <main id="main-content" className="relative grid min-h-screen place-items-center bg-[#f8f8fc] p-5">
      <button
        type="button"
        onClick={() => router.back()}
        aria-label="Go back"
        className="absolute left-5 top-5 rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-950"
      >
        <svg
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <section className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-7 shadow-xl shadow-slate-200/60 sm:p-9">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-slate-950">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-600 text-lg text-white" aria-hidden="true">✦</span>
          Crosspaths
        </Link>
        <p className="mt-8 text-sm font-semibold text-indigo-600">Welcome</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
          {step === "email" ? "Sign in to collaborate" : "Check your inbox"}
        </h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {step === "email"
            ? "Enter your email and we’ll send a one-time sign-in code. No password needed."
            : `Enter the one-time code sent to ${email.trim()}.`}
        </p>

        {step === "email" ? (
          <form className="mt-7 space-y-5" onSubmit={sendCode}>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="email">
              Email address
              <input id="email" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
            </label>
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Sending code…" : "Email me a code"}</button>
          </form>
        ) : (
          <form className="mt-7 space-y-5" onSubmit={verifyCode}>
            <label className="block text-sm font-semibold text-slate-800" htmlFor="code">
              One-time code
              <input id="code" inputMode="numeric" autoComplete="one-time-code" required minLength={6} maxLength={12} value={code} onChange={(event) => setCode(event.target.value.replace(/\s/g, ""))} placeholder="12345678" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-lg tracking-[0.3em] text-slate-950 outline-none transition placeholder:tracking-normal placeholder:text-slate-400 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10" />
            </label>
            <button disabled={loading} type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Verifying…" : "Sign in"}</button>
            <button type="button" disabled={loading} onClick={() => { setStep("email"); setCode(""); setError(""); setMessage(""); }} className="w-full text-sm font-semibold text-indigo-600 hover:text-indigo-800">Use a different email</button>
          </form>
        )}
        {message && <p role="status" className="mt-5 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{message}</p>}
        {error && <p role="alert" className="mt-5 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">{error}</p>}
      </section>
    </main>
  );
}
