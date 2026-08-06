"use client";

import { useState } from "react";
import { PageHeader, Modal, useAdminForm, AdminForm, ConfirmWrapper } from "@/components/admin/AdminCommon";
import { formatDate } from "@/lib/utils";
import { announcementSchema } from "@/lib/schemas";
import type { Announcement, MatchItem, EventItem } from "@/lib/types";
import { EmptyState } from "@/components/ui/Common";
import Link from "next/link";

const empty = {
  title: "", description: "", cover_image: "",
  match_id: "", event_id: "", external_link: ""
};

export default function AdminAnnouncementsClient({
  announcements, matches, events
}: { announcements: Announcement[]; matches: MatchItem[]; events: EventItem[] }) {
  const { loading, msg, submit, confirm, setConfirm } = useAdminForm();
  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState<any>(empty);
  const [editingId, setEditingId] = useState<string | null>(null);

  const openNew = () => { setCurrent(empty); setEditingId(null); setEditOpen(true); };
  const openEdit = (a: Announcement) => {
    setCurrent({
      title: a.title, description: a.description, cover_image: a.cover_image || "",
      match_id: a.match_id || "", event_id: a.event_id || "", external_link: a.external_link || ""
    });
    setEditingId(a.id);
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      cover_image: fd.get("cover_image") as string,
      match_id: fd.get("match_id") as string,
      event_id: fd.get("event_id") as string,
      external_link: fd.get("external_link") as string
    };
    const parsed = announcementSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      alert(issue || "Please correct the form");
      return false;
    }
    const isNew = !editingId;
    const res = await submit(
      isNew ? "POST" : "PATCH",
      isNew ? "/api/announcements" : `/api/announcements/${editingId}`,
      parsed.data,
      isNew ? "Announcement posted." : "Announcement updated."
    );
    if (res.ok) setEditOpen(false);
    return res.ok;
  };

  const remove = (id: string, title: string) => {
    setConfirm({
      title: `Delete "${title}"?`,
      danger: true,
      onConfirm: async () => { await submit("DELETE", `/api/announcements/${id}`, undefined, "Announcement deleted."); }
    });
  };

  return (
    <>
      <PageHeader
        title="Announcements"
        description="Post clan-wide news, match alerts and recruitment updates."
        actions={<button onClick={openNew} className="btn-primary">+ New Announcement</button>}
      />

      {announcements.length === 0 ? (
        <EmptyState title="No announcements yet" action={<button onClick={openNew} className="btn-primary">Post first announcement</button>} />
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <div key={a.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-display font-bold text-lg">{a.title}</h3>
                    <span className="text-xs text-muted">{formatDate(a.published_at)}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {a.match_id && (
                      <Link href={`/matches/${a.match_id}`} className="text-xs badge border-brand/30 bg-brand/10 text-brand">
                        Match link
                      </Link>
                    )}
                    {a.event_id && (
                      <Link href={`/events/${a.event_id}`} className="text-xs badge border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan">
                        Event link
                      </Link>
                    )}
                    {a.external_link && (
                      <a href={a.external_link} target="_blank" rel="noreferrer" className="text-xs badge border-gray-500/30 bg-gray-500/10 text-gray-300">
                        External link ↗
                      </a>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(a)} className="btn-ghost text-xs">Edit</button>
                  <button onClick={() => remove(a.id, a.title)} className="btn-ghost text-xs text-red-400 hover:text-red-300">Delete</button>
                </div>
              </div>
              {a.cover_image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.cover_image} alt="" className="w-full max-h-56 object-cover rounded-lg mb-3 border border-bg-border" />
              )}
              <p className="whitespace-pre-wrap text-sm text-muted">{a.description}</p>
            </div>
          ))}
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={editingId ? "Edit Announcement" : "New Announcement"} size="lg">
        <AdminForm submitText={editingId ? "Save Changes" : "Post Announcement"} onSubmit={save} loading={loading} msg={msg}>
          <div className="grid gap-3">
            <div>
              <label className="label">Title *</label>
              <input required className="input" name="title" defaultValue={current.title} />
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Cover Image URL (optional)</label>
                <input className="input" name="cover_image" defaultValue={current.cover_image} placeholder="https://..." />
              </div>
              <div>
                <label className="label">External Link (optional)</label>
                <input className="input" name="external_link" defaultValue={current.external_link} placeholder="https://..." />
              </div>
              <div>
                <label className="label">Link to Match (optional)</label>
                <select className="select" name="match_id" defaultValue={current.match_id}>
                  <option value="">None</option>
                  {matches.map((m) => (
                    <option key={m.id} value={m.id}>{m.title} — {formatDate(m.match_date)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Link to Event (optional)</label>
                <select className="select" name="event_id" defaultValue={current.event_id}>
                  <option value="">None</option>
                  {events.map((e) => (
                    <option key={e.id} value={e.id}>{e.title} — {formatDate(e.event_date)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Description *</label>
              <textarea rows={6} required className="textarea" name="description" defaultValue={current.description} />
            </div>
          </div>
        </AdminForm>
      </Modal>

      <ConfirmWrapper confirm={confirm} onCancel={() => setConfirm(null)} />
    </>
  );
}
