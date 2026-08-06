"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { LoadingSpinner, FormMessage } from "@/components/ui/Common";

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-14 max-w-md">
          <LoadingSpinner size="sm" />
        </div>
      }
    >
      <SignInForm />
    </Suspense>
  );
}

function SignInForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { supabase, refresh } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const next = sp.get("next") || "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Sign in failed");
      }
      await refresh();
      router.push(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-14 max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Sign in</h1>
        <p className="mt-1 text-sm text-muted">Required for match/event registration.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <FormMessage type="error" message={error} />}
          {next !== "/" && (
            <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs text-yellow-300">
              You'll be redirected after signing in.
            </div>
          )}
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="label">Password</label>
            <input
              className="input"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button className="btn-primary w-full" disabled={loading}>
            {loading ? <LoadingSpinner size="sm" /> : "Sign in"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted">
          Don't have an account?{" "}
          <Link href={`/auth/sign-up${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-brand hover:underline">
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
}
