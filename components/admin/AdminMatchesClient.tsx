"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Modal, useAdminForm, AdminForm, ConfirmWrapper } from "@/components/admin/AdminCommon";
import { MatchStatusBadge } from "@/components/ui/Badges";
import { formatDate, formatTime } from "@/lib/utils";
import { matchSchema } from "@/lib/schemas";
import type { MatchItem, MatchRegistration } from "@/lib/types";
import { EmptyState } from "@/components/ui/Common";

const empty: any = {
  title: "", game_mode: "BR Custom Room", match_date: "", start_time: "20:00",
  registration_deadline: "", player_limit: 20, rules: "", prize: "",
  status: "registration_open", room_password: "", room_id: "", room_published: false
};

export default function AdminMatchesPageClient({
  matches, counts, registrations
}: {
  matches: MatchItem[];
  counts: Record<string, number>;
  registrations: Record<string, MatchRegistration[]>;
}) {
  const { loading, msg, submit, confirm, setConfirm } = useAdminForm();
  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState<any>(empty);
  const [regsOpen, setRegsOpen] = useState<string | null>(null);

  const openNew = () => { setCurrent(empty); setEditOpen(true); };
  const openEdit = (m: MatchItem) => {
    setCurrent({
      title: m.title, game_mode: m.game_mode, match_date: m.match_date, start_time: m.start_time,
      registration_deadline: m.registration_deadline, player_limit: m.player_limit,
      rules: m.rules, prize: m.prize, status: m.status,
      room_password: m.room_password || "", room_id: m.room_id || "",
      room_published: !!m.room_published
    });
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      game_mode: fd.get("game_mode") as string,
      match_date: fd.get("match_date") as string,
      start_time: fd.get("start_time") as string,
      registration_deadline: fd.get("registration_deadline") as string,
      player_limit: fd.get("player_limit"),
      rules: fd.get("rules") as string,
      prize: fd.get("prize") as string,
      status: fd.get("status") as string,
      room_password: fd.get("room_password") as string,
      room_id: fd.get("room_id") as string,
      room_published: (fd.get("room_published") as string) === "on"
    };
    const parsed = matchSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      alert(issue || "Please correct the form");
      return false;
    }
    const id = current && matches.find((m) => m.title === current.title && m.match_date === current.match_date)?.id;
    const isNew = !id;
    const res = await submit(
      isNew ? "POST" : "PATCH",
      isNew ? "/api/matches" : `/api/matches/${id}`,
      parsed.data,
      isNew ? "Match created." : "Match updated."
    );
    if (res.ok) setEditOpen(false);
    return res.ok;
  };

  const remove = (id: string, title: string) => {
    setConfirm({
      title: `Delete "${title}"?`,
      description: "This removes the match and all registrations.",
      danger: true,
      onConfirm: async () => { await submit("DELETE", `/api/matches/${id}`, undefined, "Match deleted."); }
    });
  };

  const quickStatus = (id: string, newStatus: MatchItem["status"], label: string) => {
    const m = matches.find((x) => x.id === id);
    if (!m) return;
    submit("PATCH", `/api/matches/${id}`, { ...m, status: newStatus }, `${label} updated.`);
  };

  const removeReg = (matchId: string, regId: string, uname: string) => {
    setConfirm({
      title: `Remove ${uname}?`,
      description: "This will free up one slot.",
      danger: true,
      onConfirm: async () => {
        await submit("POST", `/api/matches/${matchId}/registrations/${regId}/remove`, undefined, "Registration removed.");
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Matches"
        description="Create, edit and manage clan matches."
        actions={<button onClick={openNew} className="btn-primary">+ New Match</button>}
      />

      {matches.length === 0 ? (
        <EmptyState title="No matches yet" action={<button onClick={openNew} className="btn-primary">Create first match</button>} />
      ) : (
        <div className="space-y-4">
          {matches.map((m) => {
            const regs = registrations[m.id] || [];
            const open = regsOpen === m.id;
            return (
              <div key={m.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold">{m.title}</h3>
                      <MatchStatusBadge status={m.status} />
                      <span className="text-xs text-muted">{m.game_mode}</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span className="text-muted">Date: <span className="text-white">{formatDate(m.match_date)}</span></span>
                      <span className="text-muted">Start: <span className="text-white">{formatTime(m.start_time)}</span></span>
                      <span className="text-muted">Slots: <span className="text-white">{regs.length}/{m.player_limit}</span></span>
                    </div>
                    {m.prize && <div className="mt-1 text-xs text-accent">Prize: {m.prize}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setRegsOpen(open ? null : m.id)} className="btn-secondary text-xs">
                      Registrations ({regs.length})
                    </button>
                    {m.status !== "completed" && m.status !== "cancelled" && (
                      <>
                        {m.status !== "upcoming" && m.status !== "full" && (
                          <button onClick={() => quickStatus(m.id, "upcoming", "Status")} className="btn-ghost text-xs">Mark Upcoming</button>
                        )}
                        <button onClick={() => quickStatus(m.id, "completed", "Status")} className="btn-ghost text-xs">Complete</button>
                        <button onClick={() => quickStatus(m.id, "cancelled", "Status")} className="btn-ghost text-xs text-red-400 hover:text-red-300">Cancel</button>
                      </>
                    )}
                    <Link href={`/matches/${m.id}`} className="btn-ghost text-xs">View</Link>
                    <button onClick={() => openEdit(m)} className="btn-ghost text-xs">Edit</button>
                    <button onClick={() => remove(m.id, m.title)} className="btn-ghost text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 rounded-lg bg-bg border border-bg-border p-4">
                    <h4 className="font-semibold mb-3 text-sm">Registered Players</h4>
                    {regs.length === 0 ? (
                      <div className="text-sm text-muted">No registrations yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-bg-border">
                              <th className="py-2 pr-4">Username</th>
                              <th className="py-2 pr-4">BS UID</th>
                              <th className="py-2 pr-4">Registered</th>
                              <th className="py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-bg-border/70">
                            {regs.map((r) => (
                              <tr key={r.id}>
                                <td className="py-2 pr-4 font-medium">{r.username}</td>
                                <td className="py-2 pr-4 font-mono text-xs">{r.bs_uid}</td>
                                <td className="py-2 pr-4 text-xs text-muted">{formatDate(r.registered_at)}</td>
                                <td className="py-2 text-right">
                                  <button onClick={() => removeReg(m.id, r.id, r.username)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={current.title ? "Edit Match" : "New Match"}
        size="lg"
      >
        <AdminForm submitText={current.title ? "Save Changes" : "Create Match"} onSubmit={save} loading={loading} msg={msg} onSuccessText="Saved.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input required className="input" name="title" defaultValue={current.title} />
            </div>
            <div>
              <label className="label">Game Mode</label>
              <input required className="input" name="game_mode" defaultValue={current.game_mode} placeholder="BR Custom Room / Squad Fight / etc." />
            </div>
            <div>
              <label className="label">Player / Team Limit</label>
              <input required type="number" min={1} className="input" name="player_limit" defaultValue={current.player_limit} />
            </div>
            <div>
              <label className="label">Match Date</label>
              <input required type="date" className="input" name="match_date" defaultValue={current.match_date} />
            </div>
            <div>
              <label className="label">Start Time</label>
              <input required type="time" className="input" name="start_time" defaultValue={current.start_time} />
            </div>
            <div>
              <label className="label">Registration Deadline</label>
              <input required type="date" className="input" name="registration_deadline" defaultValue={current.registration_deadline} />
            </div>
            <div>
              <label className="label">Status</label>
              <select className="select" name="status" defaultValue={current.status}>
                <option value="registration_open">Registration Open</option>
                <option value="full">Full</option>
                <option value="upcoming">Upcoming</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="label">Prize / Reward</label>
              <input className="input" name="prize" defaultValue={current.prize} placeholder="e.g. 5,000 Diamonds" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Rules</label>
              <textarea rows={4} className="textarea" name="rules" defaultValue={current.rules} placeholder="Match rules, format, scoring..." />
            </div>
            <div className="sm:col-span-2 rounded-lg bg-bg p-4 border border-bg-border">
              <div className="text-xs uppercase tracking-wider text-gray-500 mb-2">Room Info (private, only published to registrants when toggled)</div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="label">Room ID</label>
                  <input className="input" name="room_id" defaultValue={current.room_id} />
                </div>
                <div>
                  <label className="label">Password</label>
                  <input className="input" name="room_password" defaultValue={current.room_password} />
                </div>
                <label className="flex items-end gap-2">
                  <input type="checkbox" name="room_published" defaultChecked={current.room_published} className="h-4 w-4" />
                  <span className="text-sm">Published to registrants</span>
                </label>
              </div>
            </div>
          </div>
        </AdminForm>
      </Modal>

      <ConfirmWrapper confirm={confirm} onCancel={() => setConfirm(null)} />
    </>
  );
}
