"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Modal, useAdminForm, AdminForm, ConfirmWrapper } from "@/components/admin/AdminCommon";
import { RoleBadge } from "@/components/ui/Badges";
import { formatDate, initials } from "@/lib/utils";
import { memberSchema } from "@/lib/schemas";
import type { Member, ClanRole } from "@/lib/types";
import { EmptyState } from "@/components/ui/Common";

const empty = {
  username: "", blood_strike_uid: "", role: "member" as ClanRole,
  avatar_url: "", preferred_mode: "BR Custom Room",
  join_date: new Date().toISOString().slice(0, 10), bio: "", user_id: ""
};

export default function AdminMembersClient({ members }: { members: Member[] }) {
  const { loading, msg, submit, confirm, setConfirm } = useAdminForm();
  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState<Member | typeof empty>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openNew = () => { setCurrent(empty); setEditingId(null); setEditOpen(true); };
  const openEdit = (m: Member) => {
    setCurrent({
      username: m.username, blood_strike_uid: m.blood_strike_uid, role: m.role,
      avatar_url: m.avatar_url || "", preferred_mode: m.preferred_mode,
      join_date: typeof m.join_date === "string" ? m.join_date : new Date(m.join_date).toISOString().slice(0, 10),
      bio: m.bio || "", user_id: m.user_id || ""
    });
    setEditingId(m.id);
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const payload = {
      username: fd.get("username") as string,
      blood_strike_uid: fd.get("blood_strike_uid") as string,
      role: fd.get("role") as ClanRole,
      avatar_url: fd.get("avatar_url") as string,
      preferred_mode: fd.get("preferred_mode") as string,
      join_date: fd.get("join_date") as string,
      bio: fd.get("bio") as string,
      user_id: ""
    };
    const parsed = memberSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      alert(issue || "Please correct the form");
      return false;
    }
    const isNew = !editingId;
    const res = await submit(
      isNew ? "POST" : "PATCH",
      isNew ? "/api/members" : `/api/members/${editingId}`,
      parsed.data,
      isNew ? "Member added." : "Member updated."
    );
    if (res.ok) setEditOpen(false);
    return res.ok;
  };

  const remove = (id: string, name: string) => {
    setConfirm({
      title: `Remove ${name}?`,
      description: "This will remove them from the members roster.",
      danger: true,
      onConfirm: async () => { await submit("DELETE", `/api/members/${id}`, undefined, "Member removed."); }
    });
  };

  const changeRole = (m: Member, role: ClanRole) => {
    submit(
      "PATCH",
      `/api/members/${m.id}`,
      { ...m, avatar_url: m.avatar_url || "", bio: m.bio || "", user_id: m.user_id || "",
        join_date: typeof m.join_date === "string" ? m.join_date : new Date(m.join_date).toISOString().slice(0, 10), role },
      "Role updated."
    );
  };

  return (
    <>
      <PageHeader
        title="Members"
        description="Manage the clan roster, roles and join dates."
        actions={<button onClick={openNew} className="btn-primary">+ Add Member</button>}
      />

      <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
        The "Role" column below is a clan rank shown on the public roster — it does{" "}
        <span className="font-semibold">not</span> grant access to this dashboard. To make someone a site admin,
        go to{" "}
        <Link href="/admin/access" className="underline hover:text-white">
          Admin → Access
        </Link>
        .
      </div>

      {members.length === 0 ? (
        <EmptyState title="No members yet" action={<button onClick={openNew} className="btn-primary">Add first member</button>} />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted bg-bg border-b border-bg-border">
                  <th className="py-3 px-4">Member</th>
                  <th className="py-3 px-4">UID</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Mode</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/70">
                {members.map((m) => (
                  <tr key={m.id} className="hover:bg-bg-soft/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 font-bold shrink-0">
                          {m.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={m.avatar_url} alt="" className="h-full w-full rounded-lg object-cover" />
                          ) : initials(m.username)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{m.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-xs">{m.blood_strike_uid}</td>
                    <td className="py-3 px-4">
                      <select
                        value={m.role}
                        onChange={(e) => changeRole(m, e.target.value as ClanRole)}
                        className="bg-bg border border-bg-border rounded-md px-2 py-1 text-xs"
                      >
                        {(["owner","admin","moderator","member","trial"] as ClanRole[]).map((r) => (
                          <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-gray-300">{m.preferred_mode}</td>
                    <td className="py-3 px-4 text-muted text-xs">{formatDate(m.join_date)}</td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button onClick={() => openEdit(m)} className="text-xs text-brand hover:underline mr-3">Edit</button>
                      <button onClick={() => remove(m.id, m.username)} className="text-xs text-red-400 hover:underline">Remove</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? "Edit Member" : "Add Member"}>
        <AdminForm submitText={editingId ? "Save Changes" : "Add Member"} onSubmit={save} loading={loading} msg={msg}>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label">Username *</label>
              <input required className="input" name="username" defaultValue={current.username} />
            </div>
            <div>
              <label className="label">BS UID *</label>
              <input required className="input" name="blood_strike_uid" defaultValue={current.blood_strike_uid} />
            </div>
            <div>
              <label className="label">Role *</label>
              <select className="select" name="role" defaultValue={current.role}>
                <option value="owner">Owner</option>
                <option value="admin">Admin</option>
                <option value="moderator">Moderator</option>
                <option value="member">Member</option>
                <option value="trial">Trial Member</option>
              </select>
            </div>
            <div>
              <label className="label">Preferred Mode *</label>
              <input required className="input" name="preferred_mode" defaultValue={current.preferred_mode} />
            </div>
            <div>
              <label className="label">Join Date *</label>
              <input type="date" required className="input" name="join_date" defaultValue={current.join_date} />
            </div>
            <div>
              <label className="label">Avatar URL</label>
              <input className="input" name="avatar_url" defaultValue={current.avatar_url ?? undefined} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Bio</label>
              <textarea rows={3} className="textarea" name="bio" defaultValue={current.bio ?? undefined} />
            </div>
          </div>
        </AdminForm>
      </Modal>

      <ConfirmWrapper confirm={confirm} onCancel={() => setConfirm(null)} />
    </>
  );
}
