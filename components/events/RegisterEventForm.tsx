"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner, FormMessage } from "@/components/ui/Common";

export function RegisterEventForm({
  eventId, canRegister, reason
}: { eventId: string; canRegister: boolean; reason: string | null }) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; message: string } | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setLoading(true);
    try {
      const res = await fetch(`/api/events/${eventId}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Registration failed");
      setMsg({ type: "success", message: "You've been registered!" });
      setUsername("");
      setTimeout(() => router.refresh(), 700);
    } catch (err: any) {
      setMsg({ type: "error", message: err.message || "Registration failed" });
    } finally {
      setLoading(false);
    }
  };

  if (!canRegister) {
    return (
      <div className="rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-sm text-red-300">
        Registration closed. {reason}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      {msg && <FormMessage type={msg.type} message={msg.message} />}
      <div>
        <label className="label">Display name</label>
        <input required className="input" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Your in-game name" />
      </div>
      <button disabled={loading} className="btn-primary w-full">
        {loading ? <LoadingSpinner size="sm" /> : "Register"}
      </button>
    </form>
  );
}
