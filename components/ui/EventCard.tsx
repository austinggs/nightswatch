import Link from "next/link";
import type { EventItem } from "@/lib/types";
import { EventStatusBadge, EventTypeBadge } from "./Badges";
import { formatDate, formatTime } from "@/lib/utils";

export function EventCard({ event, registerCount, children }: { event: EventItem; registerCount?: number; children?: React.ReactNode }) {
  const slots = event.participant_limit || 0;
  const registered = registerCount ?? 0;
  const pct = slots > 0 ? Math.min(100, (registered / slots) * 100) : 0;

  return (
    <article className="card animate-fadeIn group hover:border-accent-cyan/40 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <EventTypeBadge type={event.event_type} />
          <h3 className="font-display text-lg font-bold">{event.title}</h3>
        </div>
        <EventStatusBadge status={event.status} />
      </div>

      {event.description && (
        <p className="mt-3 text-sm text-muted line-clamp-3">{event.description}</p>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Date</div>
          <div className="font-medium">{formatDate(event.event_date)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Start</div>
          <div className="font-medium">{formatTime(event.start_time)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Deadline</div>
          <div className="font-medium">{formatDate(event.registration_deadline)}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-gray-500">Slots</div>
          <div className="font-medium">{registered} / {slots}</div>
        </div>
      </div>

      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-bg">
        <div
          className={
            pct >= 100 ? "h-full bg-yellow-500"
            : pct >= 75 ? "h-full bg-accent-cyan"
            : "h-full bg-brand"
          }
          style={{ width: `${pct}%` }}
        />
      </div>

      {event.prize && (
        <div className="mt-4 rounded-lg bg-bg px-3 py-2 text-xs">
          <span className="text-gray-400">Prize: </span>
          <span className="font-semibold text-accent">{event.prize}</span>
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <Link href={`/events/${event.id}`} className="btn-secondary flex-1 text-sm">View details</Link>
        {children}
      </div>
    </article>
  );
}
