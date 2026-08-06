"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { LoadingSpinner, FormMessage } from "@/components/ui/Common";

export default function SignUpPage() {
  return (
    <Suspense
      fallback={
        <div className="container-x py-14 max-w-md">
          <LoadingSpinner size="sm" />
        </div>
      }
    >
      <SignUpForm />
    </Suspense>
  );
}

function SignUpForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const { refresh } = useSupabase();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const next = sp.get("next") || "/";

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Sign up failed");
      }
      await refresh();
      setDone(true);
      setTimeout(() => {
        router.push(next);
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-x py-14 max-w-md">
      <div className="card">
        <h1 className="font-display text-2xl font-bold">Create account</h1>
        <p className="mt-1 text-sm text-muted">Sign up to register for matches and events.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {error && <FormMessage type="error" message={error} />}
          {done && <FormMessage type="success" message="Account created! Redirecting..." />}
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
            <div className="mt-1 text-[11px] text-gray-500">Minimum 6 characters.</div>
          </div>
          <button className="btn-primary w-full" disabled={loading || done}>
            {loading ? <LoadingSpinner size="sm" /> : "Create account"}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-muted">
          Already have an account?{" "}
          <Link href={`/auth/sign-in${next !== "/" ? `?next=${encodeURIComponent(next)}` : ""}`} className="text-brand hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
