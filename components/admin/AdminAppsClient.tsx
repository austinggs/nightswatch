"use client";

import { useState } from "react";
import { PageHeader, Modal, useAdminForm, AdminForm, ConfirmWrapper } from "@/components/admin/AdminCommon";
import { AppStatusBadge } from "@/components/ui/Badges";
import { formatDate, whatsappLink } from "@/lib/utils";
import { appStatusUpdateSchema, memberSchema } from "@/lib/schemas";
import type { Application, ApplicationStatus } from "@/lib/types";
import { EmptyState } from "@/components/ui/Common";

export default function AdminAppsClient({ applications }: { applications: Application[] }) {
  const { loading, msg, submit, confirm, setConfirm } = useAdminForm();
  const [openId, setOpenId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | ApplicationStatus>("all");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addMemberFrom, setAddMemberFrom] = useState<Application | null>(null);

  const filtered = filter === "all" ? applications : applications.filter((a) => a.status === filter);

  const updateStatus = async (id: string, e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const payload = {
      status: fd.get("status") as ApplicationStatus,
      admin_note: fd.get("admin_note") as string
    };
    const parsed = appStatusUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      alert("Invalid input");
      return false;
    }
    const res = await submit("POST", `/api/applications/${id}/status`, parsed.data, "Status updated.");
    if (res.ok) setOpenId(null);
    return res.ok;
  };

  const approveAsMember = (app: Application) => {
    setAddMemberFrom(app);
    setAddMemberOpen(true);
  };

  const createMember = async (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const payload = {
      username: (fd.get("username") as string) || addMemberFrom?.bs_username || "",
      blood_strike_uid: (fd.get("blood_strike_uid") as string) || addMemberFrom?.bs_uid || "",
      role: fd.get("role") as any,
      avatar_url: fd.get("avatar_url") as string,
      preferred_mode: (fd.get("preferred_mode") as string) || addMemberFrom?.preferred_mode || "BR",
      join_date: fd.get("join_date") as string || new Date().toISOString().slice(0, 10),
      bio: fd.get("bio") as string,
      user_id: ""
    };
    const parsed = memberSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      alert(issue || "Please correct the form");
      return false;
    }
    const res = await submit("POST", "/api/members", parsed.data, "Member added.");
    if (res.ok) {
      if (addMemberFrom) {
        await submit(
          "POST",
          `/api/applications/${addMemberFrom.id}/status`,
          { status: "accepted", admin_note: addMemberFrom.admin_note || "Added as member." }
        );
      }
      setAddMemberOpen(false);
      setAddMemberFrom(null);
    }
    return res.ok;
  };

  return (
    <>
      <PageHeader
        title="Tryout Applications"
        description="Review clan applications and manage recruitment status."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {(["all", "pending", "reviewing", "tryout", "accepted", "rejected"] as const).map((k) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition " +
              (filter === k
                ? "border-brand bg-brand/15 text-brand"
                : "border-bg-border text-gray-300 hover:bg-bg-soft")
            }
          >
            {k[0].toUpperCase() + k.slice(1)}{" "}
            <span className="text-muted">
              ({k === "all" ? applications.length : applications.filter((a) => a.status === k).length})
            </span>
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="No applications" description="Nothing in this filter yet." />
      ) : (
        <div className="space-y-4">
          {filtered.map((a) => {
            const open = openId === a.id;
            return (
              <div key={a.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-display text-lg font-bold">{a.nickname}</h3>
                      <AppStatusBadge status={a.status} />
                      <span className="text-xs text-muted">Applied {formatDate(a.submitted_at)}</span>
                    </div>
                    <div className="mt-1 text-xs text-muted">
                      {a.bs_username} · UID {a.bs_uid} · Rank: {a.current_rank} · Mode: {a.preferred_mode}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={whatsappLink(a.whatsapp_number, `Hi ${a.nickname}, about your clan application...`)}
                      target="_blank" rel="noreferrer"
                      className="btn-whatsapp text-xs"
                    >
                      Contact on WhatsApp
                    </a>
                    <button onClick={() => setOpenId(open ? null : a.id)} className="btn-secondary text-xs">
                      {open ? "Close" : "Manage"}
                    </button>
                  </div>
                </div>

                {open && (
                  <div className="mt-4 grid gap-5 md:grid-cols-2">
                    <div className="space-y-3 text-sm">
                      <Info label="Nickname" value={a.nickname} />
                      <Info label="BS Username" value={a.bs_username} />
                      <Info label="BS UID" value={a.bs_uid} mono />
                      <Info label="Preferred Mode" value={a.preferred_mode} />
                      <Info label="Current Rank" value={a.current_rank} />
                      <Info label="Previous Clan" value={a.previous_clan || "—"} />
                      <Info label="WhatsApp (admin only)" value={a.whatsapp_number} mono />
                      <Info label="Social" value={a.social_username || "—"} />
                      {a.gameplay_link && (
                        <div>
                          <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Gameplay link</div>
                          <a href={a.gameplay_link} target="_blank" rel="noreferrer" className="text-brand hover:underline text-xs truncate inline-block max-w-full">
                            {a.gameplay_link}
                          </a>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Experience</div>
                        <div className="rounded-lg bg-bg p-3 text-sm text-muted whitespace-pre-wrap">{a.experience}</div>
                      </div>
                      <div>
                        <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Why they want to join</div>
                        <div className="rounded-lg bg-bg p-3 text-sm text-muted whitespace-pre-wrap">{a.why_join}</div>
                      </div>
                      <AdminForm submitText="Update Status" loading={loading} msg={msg} onSubmit={(e) => updateStatus(a.id, e)}>
                        <div className="grid gap-3">
                          <div>
                            <label className="label">Status</label>
                            <select className="select" name="status" defaultValue={a.status}>
                              <option value="pending">Pending</option>
                              <option value="reviewing">Reviewing</option>
                              <option value="tryout">Tryout</option>
                              <option value="accepted">Accepted</option>
                              <option value="rejected">Rejected</option>
                            </select>
                          </div>
                          <div>
                            <label className="label">Private Admin Note</label>
                            <textarea rows={2} className="textarea" name="admin_note" defaultValue={a.admin_note || ""} />
                          </div>
                        </div>
                      </AdminForm>
                      {(a.status === "accepted" || a.status === "tryout") && (
                        <button onClick={() => approveAsMember(a)} className="btn-primary w-full">
                          Add as Member
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <Modal
        open={addMemberOpen}
        onClose={() => { setAddMemberOpen(false); setAddMemberFrom(null); }}
        title="Add Member from Application"
      >
        <AdminForm submitText="Add Member" onSubmit={createMember} loading={loading} msg={msg} onSuccessText="Member added.">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Username</label>
              <input required name="username" className="input" defaultValue={addMemberFrom?.bs_username} />
            </div>
            <div>
              <label className="label">BS UID</label>
              <input required name="blood_strike_uid" className="input" defaultValue={addMemberFrom?.bs_uid} />
            </div>
            <div>
              <label className="label">Role</label>
              <select className="select" name="role" defaultValue="trial">
                <option value="trial">Trial Member</option>
                <option value="member">Member</option>
                <option value="moderator">Moderator</option>
                <option value="admin">Admin</option>
                <option value="owner">Owner</option>
              </select>
            </div>
            <div>
              <label className="label">Preferred Mode</label>
              <input name="preferred_mode" className="input" defaultValue={addMemberFrom?.preferred_mode} />
            </div>
            <div>
              <label className="label">Join Date</label>
              <input type="date" name="join_date" className="input" defaultValue={new Date().toISOString().slice(0, 10)} />
            </div>
            <div>
              <label className="label">Avatar URL (optional)</label>
              <input name="avatar_url" className="input" />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio (optional)</label>
              <textarea rows={2} name="bio" className="textarea" />
            </div>
          </div>
        </AdminForm>
      </Modal>

      <ConfirmWrapper confirm={confirm} onCancel={() => setConfirm(null)} />
    </>
  );
}

function Info({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-0.5">{label}</div>
      <div className={mono ? "font-mono text-xs" : "text-sm"}>{value}</div>
    </div>
  );
}
