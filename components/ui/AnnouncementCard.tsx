import type { Announcement } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export function AnnouncementCard({ a }: { a: Announcement }) {
  return (
    <article className="card animate-fadeIn">
      {a.cover_image && (
        <div className="mb-4 -mx-5 -mt-5 overflow-hidden rounded-t-xl aspect-[16/6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={a.cover_image} alt="" className="h-full w-full object-cover" />
        </div>
      )}
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-display text-lg font-bold">{a.title}</h3>
        <span className="text-xs text-muted whitespace-nowrap">{formatDate(a.published_at)}</span>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-sm text-muted line-clamp-5">{a.description}</p>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        {a.match_id && (
          <Link href={`/matches/${a.match_id}`} className="btn-outline text-xs">View Match</Link>
        )}
        {a.event_id && (
          <Link href={`/events/${a.event_id}`} className="btn-outline text-xs">View Event</Link>
        )}
        {a.external_link && (
          <a href={a.external_link} target="_blank" rel="noreferrer" className="btn-ghost text-xs">
            Learn more
          </a>
        )}
      </div>
    </article>
  );
}
