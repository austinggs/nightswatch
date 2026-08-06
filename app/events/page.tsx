// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getEvents, getEventRegistrations } from "@/lib/queries";
import { EventCard } from "@/components/ui/EventCard";
import { EmptyState } from "@/components/ui/Common";
import Link from "next/link";

export const metadata = { title: "Events — Clan Hub" };

export default async function EventsPage() {
  const events = await getEvents();

  const upcoming = events.filter((e) => e.status !== "completed" && e.status !== "cancelled");
  const past = events.filter((e) => e.status === "completed" || e.status === "cancelled");

  const counts = new Map<string, number>();
  for (const e of events) {
    const regs = await getEventRegistrations(e.id);
    counts.set(e.id, regs.length);
  }

  return (
    <div className="container-x py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="section-title">Events</h1>
        <p className="mt-2 text-sm text-muted">Tournaments, scrims, giveaways, trainings and more.</p>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4">
          Upcoming <span className="text-muted font-normal text-sm">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming events"
            description="Keep an eye on the announcements for event launches."
            action={<Link href="/announcements" className="btn-secondary">View announcements</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <EventCard key={e.id} event={e} registerCount={counts.get(e.id)} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4">
            Past <span className="text-muted font-normal text-sm">({past.length})</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.slice(0, 9).map((e) => (
              <EventCard key={e.id} event={e} registerCount={counts.get(e.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
