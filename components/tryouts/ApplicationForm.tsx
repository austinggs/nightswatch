"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LoadingSpinner, FormMessage } from "@/components/ui/Common";
import { applicationSchema } from "@/lib/schemas";
import Link from "next/link";

export function ApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [msg, setMsg] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [form, setForm] = useState({
    nickname: "",
    bs_username: "",
    bs_uid: "",
    preferred_mode: "BR Custom Room",
    current_rank: "",
    previous_clan: "",
    experience: "",
    why_join: "",
    whatsapp_number: "",
    social_username: "",
    gameplay_link: ""
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    const parsed = applicationSchema.safeParse(form);
    if (!parsed.success) {
      const issues = parsed.error.flatten().fieldErrors;
      const first = Object.values(issues)[0]?.[0];
      setMsg({ type: "error", message: first || "Please check your input and try again." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data)
      });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || "Submission failed");
      setSuccess(true);
    } catch (err: any) {
      setMsg({ type: "error", message: err.message || "Submission failed" });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="card border-green-500/30">
        <div className="text-center py-10">
          <div className="text-5xl mb-3">🎉</div>
          <h3 className="font-display text-2xl font-bold">Application submitted!</h3>
          <p className="mt-3 text-muted max-w-md mx-auto">
            Thanks for applying to the clan. Our admin team will review your profile and reach out on WhatsApp with next steps.
            Good luck!
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn-primary">Back to home</Link>
            <Link href="/announcements" className="btn-secondary">View announcements</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="card space-y-4">
      <h3 className="font-display text-xl font-bold">Application form</h3>
      <p className="text-xs text-muted">
        All fields marked <span className="text-brand">*</span> are required. Your WhatsApp number stays private.
      </p>
      {msg && <FormMessage type={msg.type} message={msg.message} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Nickname <span className="text-brand">*</span></label>
          <input required className="input" value={form.nickname} onChange={set("nickname")} placeholder="What should we call you?" />
        </div>
        <div>
          <label className="label">Blood Strike Username <span className="text-brand">*</span></label>
          <input required className="input" value={form.bs_username} onChange={set("bs_username")} placeholder="In-game username" />
        </div>
        <div>
          <label className="label">Blood Strike UID <span className="text-brand">*</span></label>
          <input required className="input" value={form.bs_uid} onChange={set("bs_uid")} placeholder="e.g. BS100001" />
        </div>
        <div>
          <label className="label">Preferred Game Mode <span className="text-brand">*</span></label>
          <select className="select" value={form.preferred_mode} onChange={set("preferred_mode")}>
            {["BR Custom Room", "Squad Fight", "Team Deathmatch", "Clash Squad", "Other"].map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Current Rank <span className="text-brand">*</span></label>
          <input required className="input" value={form.current_rank} onChange={set("current_rank")} placeholder="e.g. Master / Grandmaster / Pro III" />
        </div>
        <div>
          <label className="label">Previous Clan</label>
          <input className="input" value={form.previous_clan} onChange={set("previous_clan")} placeholder="None if first clan" />
        </div>
      </div>

      <div>
        <label className="label">Experience <span className="text-brand">*</span></label>
        <textarea
          required
          rows={3}
          className="textarea"
          value={form.experience}
          onChange={set("experience")}
          placeholder="Tell us about your Blood Strike experience, past tournaments, play style..."
        />
      </div>

      <div>
        <label className="label">Why do you want to join? <span className="text-brand">*</span></label>
        <textarea
          required
          rows={3}
          className="textarea"
          value={form.why_join}
          onChange={set("why_join")}
          placeholder="Why this clan? What are your goals?"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">WhatsApp Number <span className="text-brand">*</span></label>
          <input
            required
            className="input"
            type="tel"
            value={form.whatsapp_number}
            onChange={set("whatsapp_number")}
            placeholder="With country code, e.g. +1 555 123 4567"
          />
          <div className="text-[11px] text-gray-500 mt-1">Never shown publicly.</div>
        </div>
        <div>
          <label className="label">Social (Optional)</label>
          <input className="input" value={form.social_username} onChange={set("social_username")} placeholder="Instagram / TikTok / YouTube" />
        </div>
      </div>

      <div>
        <label className="label">Gameplay / Video Link (Optional)</label>
        <input className="input" type="url" value={form.gameplay_link} onChange={set("gameplay_link")} placeholder="YouTube / TikTok / stream link" />
      </div>

      <button disabled={loading} className="btn-primary w-full">
        {loading ? <LoadingSpinner size="sm" /> : "Submit Application"}
      </button>
    </form>
  );
}
