"use client";

import { useState } from "react";
import Link from "next/link";
import { PageHeader, Modal, useAdminForm, AdminForm, ConfirmWrapper } from "@/components/admin/AdminCommon";
import { EventStatusBadge, EventTypeBadge } from "@/components/ui/Badges";
import { formatDate, formatTime } from "@/lib/utils";
import { eventSchema } from "@/lib/schemas";
import type { EventItem, EventRegistration, EventType, EventStatus } from "@/lib/types";
import { EmptyState } from "@/components/ui/Common";

const empty: any = {
  title: "", description: "", event_type: "tournament", event_date: "", start_time: "20:00",
  registration_deadline: "", rules: "", prize: "", participant_limit: 50, status: "registration_open"
};

export default function AdminEventsPageClient({
  events, counts, registrations
}: {
  events: EventItem[];
  counts: Record<string, number>;
  registrations: Record<string, EventRegistration[]>;
}) {
  const { loading, msg, submit, confirm, setConfirm } = useAdminForm();
  const [editOpen, setEditOpen] = useState(false);
  const [current, setCurrent] = useState<any>(empty);
  const [regsOpen, setRegsOpen] = useState<string | null>(null);

  const openNew = () => { setCurrent(empty); setEditOpen(true); };
  const openEdit = (e: EventItem) => {
    setCurrent({
      title: e.title, description: e.description, event_type: e.event_type,
      event_date: e.event_date, start_time: e.start_time,
      registration_deadline: e.registration_deadline, rules: e.rules,
      prize: e.prize, participant_limit: e.participant_limit, status: e.status
    });
    setEditOpen(true);
  };

  const save = async (e: React.FormEvent<HTMLFormElement>) => {
    const fd = new FormData(e.currentTarget);
    const payload = {
      title: fd.get("title") as string,
      description: fd.get("description") as string,
      event_type: fd.get("event_type") as EventType,
      event_date: fd.get("event_date") as string,
      start_time: fd.get("start_time") as string,
      registration_deadline: fd.get("registration_deadline") as string,
      rules: fd.get("rules") as string,
      prize: fd.get("prize") as string,
      participant_limit: fd.get("participant_limit"),
      status: fd.get("status") as EventStatus
    };
    const parsed = eventSchema.safeParse(payload);
    if (!parsed.success) {
      const issue = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
      alert(issue || "Please correct the form");
      return false;
    }
    const id = current && events.find((ev) => ev.title === current.title && ev.event_date === current.event_date)?.id;
    const isNew = !id;
    const res = await submit(
      isNew ? "POST" : "PATCH",
      isNew ? "/api/events" : `/api/events/${id}`,
      parsed.data,
      isNew ? "Event created." : "Event updated."
    );
    if (res.ok) setEditOpen(false);
    return res.ok;
  };

  const remove = (id: string, title: string) => {
    setConfirm({
      title: `Delete "${title}"?`,
      description: "This removes the event and all registrations.",
      danger: true,
      onConfirm: async () => { await submit("DELETE", `/api/events/${id}`, undefined, "Event deleted."); }
    });
  };

  const quickStatus = (id: string, newStatus: EventItem["status"]) => {
    const m = events.find((x) => x.id === id);
    if (!m) return;
    submit("PATCH", `/api/events/${id}`, { ...m, status: newStatus }, "Status updated.");
  };

  const removeReg = (eventId: string, regId: string, uname: string) => {
    setConfirm({
      title: `Remove ${uname}?`,
      description: "This will free up one slot.",
      danger: true,
      onConfirm: async () => {
        await submit("POST", `/api/events/${eventId}/registrations/${regId}/remove`, undefined, "Registration removed.");
      }
    });
  };

  return (
    <>
      <PageHeader
        title="Events"
        description="Create and manage tournaments, scrims, giveaways, trainings and clan events."
        actions={<button onClick={openNew} className="btn-primary">+ New Event</button>}
      />

      {events.length === 0 ? (
        <EmptyState title="No events yet" action={<button onClick={openNew} className="btn-primary">Create first event</button>} />
      ) : (
        <div className="space-y-4">
          {events.map((e) => {
            const regs = registrations[e.id] || [];
            const open = regsOpen === e.id;
            return (
              <div key={e.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <EventTypeBadge type={e.event_type} />
                      <h3 className="font-display text-lg font-bold">{e.title}</h3>
                      <EventStatusBadge status={e.status} />
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                      <span className="text-muted">Date: <span className="text-white">{formatDate(e.event_date)}</span></span>
                      <span className="text-muted">Start: <span className="text-white">{formatTime(e.start_time)}</span></span>
                      <span className="text-muted">Slots: <span className="text-white">{regs.length}/{e.participant_limit}</span></span>
                    </div>
                    {e.prize && <div className="mt-1 text-xs text-accent">Prize: {e.prize}</div>}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => setRegsOpen(open ? null : e.id)} className="btn-secondary text-xs">
                      Participants ({regs.length})
                    </button>
                    {e.status !== "completed" && e.status !== "cancelled" && (
                      <>
                        {e.status !== "upcoming" && e.status !== "full" && (
                          <button onClick={() => quickStatus(e.id, "upcoming")} className="btn-ghost text-xs">Mark Upcoming</button>
                        )}
                        <button onClick={() => quickStatus(e.id, "completed")} className="btn-ghost text-xs">Complete</button>
                        <button onClick={() => quickStatus(e.id, "cancelled")} className="btn-ghost text-xs text-red-400 hover:text-red-300">Cancel</button>
                      </>
                    )}
                    <Link href={`/events/${e.id}`} className="btn-ghost text-xs">View</Link>
                    <button onClick={() => openEdit(e)} className="btn-ghost text-xs">Edit</button>
                    <button onClick={() => remove(e.id, e.title)} className="btn-ghost text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
                {open && (
                  <div className="mt-4 rounded-lg bg-bg border border-bg-border p-4">
                    <h4 className="font-semibold mb-3 text-sm">Participants</h4>
                    {regs.length === 0 ? (
                      <div className="text-sm text-muted">No registrations yet.</div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs uppercase tracking-wider text-muted border-b border-bg-border">
                              <th className="py-2 pr-4">Username</th>
                              <th className="py-2 pr-4">Registered</th>
                              <th className="py-2"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-bg-border/70">
                            {regs.map((r) => (
                              <tr key={r.id}>
                                <td className="py-2 pr-4 font-medium">{r.username}</td>
                                <td className="py-2 pr-4 text-xs text-muted">{formatDate(r.registered_at)}</td>
                                <td className="py-2 text-right">
                                  <button onClick={() => removeReg(e.id, r.id, r.username)} className="text-xs text-red-400 hover:text-red-300">Remove</button>
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

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={current.title ? "Edit Event" : "New Event"} size="lg">
        <AdminForm submitText={current.title ? "Save Changes" : "Create Event"} onSubmit={save} loading={loading} msg={msg} onSuccessText="Saved.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="label">Title</label>
              <input required className="input" name="title" defaultValue={current.title} />
            </div>
            <div>
              <label className="label">Event Type</label>
              <select className="select" name="event_type" defaultValue={current.event_type}>
                <option value="tournament">Tournament</option>
                <option value="scrim">Scrim</option>
                <option value="giveaway">Giveaway</option>
                <option value="training">Training</option>
                <option value="clan_event">Clan Event</option>
              </select>
            </div>
            <div>
              <label className="label">Participant Limit</label>
              <input required type="number" min={1} className="input" name="participant_limit" defaultValue={current.participant_limit} />
            </div>
            <div>
              <label className="label">Event Date</label>
              <input required type="date" className="input" name="event_date" defaultValue={current.event_date} />
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
              <input className="input" name="prize" defaultValue={current.prize} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Description</label>
              <textarea rows={3} className="textarea" name="description" defaultValue={current.description} />
            </div>
            <div className="sm:col-span-2">
              <label className="label">Rules</label>
              <textarea rows={4} className="textarea" name="rules" defaultValue={current.rules} />
            </div>
          </div>
        </AdminForm>
      </Modal>

      <ConfirmWrapper confirm={confirm} onCancel={() => setConfirm(null)} />
    </>
  );
}
