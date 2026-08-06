// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getEventById, getEventRegistrations, isUserRegisteredForEvent, getSettings
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { EventStatusBadge, EventTypeBadge } from "@/components/ui/Badges";
import { formatDate, formatTime, whatsappLink, isPast } from "@/lib/utils";
import { RegisterEventForm } from "@/components/events/RegisterEventForm";

export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const ev = await getEventById(params.id);
  if (!ev) return notFound();

  const [regs, settings, user] = await Promise.all([
    getEventRegistrations(params.id),
    getSettings(),
    getCurrentUser()
  ]);
  const registered = user ? await isUserRegisteredForEvent(params.id, user.id) : false;

  const slots = ev.participant_limit || 0;
  const deadlinePast = isPast(ev.registration_deadline, "23:59");
  const canRegister =
    !!user &&
    !registered &&
    !deadlinePast &&
    regs.length < slots &&
    ev.status !== "cancelled" &&
    ev.status !== "completed" &&
    ev.status !== "full";

  return (
    <div className="container-x py-10 animate-fadeIn max-w-4xl">
      <Link href="/events" className="text-sm text-muted hover:text-white">← Back to events</Link>

      <div className="mt-4 card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <EventTypeBadge type={ev.event_type} />
            <h1 className="font-display text-3xl font-bold">{ev.title}</h1>
          </div>
          <EventStatusBadge status={ev.status} />
        </div>

        {ev.description && (
          <p className="mt-5 whitespace-pre-wrap text-muted">{ev.description}</p>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Date" value={formatDate(ev.event_date)} />
          <Stat label="Start Time" value={formatTime(ev.start_time)} />
          <Stat label="Deadline" value={formatDate(ev.registration_deadline)} />
          <Stat label="Slots" value={`${regs.length} / ${slots}`} />
        </div>

        {ev.prize && (
          <div className="mt-5 rounded-lg bg-bg border border-bg-border px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-gray-500">Prize / Reward</div>
            <div className="mt-1 font-semibold text-accent">{ev.prize}</div>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
            {ev.rules ? (
              <div>
                <h3 className="font-display font-bold mb-2">Rules</h3>
                <div className="whitespace-pre-wrap text-sm text-muted rounded-lg bg-bg p-4 border border-bg-border">
                  {ev.rules}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">No rules posted yet.</div>
            )}
          </div>

          <aside className="md:col-span-2 space-y-4">
            <div className="card !p-4">
              <h3 className="font-display font-bold mb-3">Registration</h3>
              {!user && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">Sign in to register for this event.</p>
                  <Link href={`/auth/sign-in?next=${encodeURIComponent(`/events/${ev.id}`)}`} className="btn-primary w-full">
                    Sign in to register
                  </Link>
                </div>
              )}
              {user && registered && (
                <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-3 text-sm text-green-300">
                  ✅ You are registered.
                </div>
              )}
              {user && !registered && (
                <RegisterEventForm
                  eventId={ev.id}
                  canRegister={canRegister}
                  reason={
                    deadlinePast ? "Registration deadline passed."
                    : ev.status === "full" ? "Event is full."
                    : ev.status === "cancelled" ? "Event cancelled."
                    : ev.status === "completed" ? "Event completed."
                    : regs.length >= slots ? "No slots available."
                    : null
                  }
                />
              )}
              <a
                href={whatsappLink(settings?.whatsapp_contact || "", `Hi! I have a question about ${ev.title}.`)}
                target="_blank" rel="noreferrer"
                className="btn-whatsapp w-full mt-3 text-sm"
              >
                Contact Event Host
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-bg p-3 border border-bg-border">
      <div className="text-[10px] uppercase tracking-wider text-gray-500">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
