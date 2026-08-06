// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import Link from "next/link";
import {
  getSettings, getNextUpcomingMatch, getNextUpcomingEvent,
  getLatestAnnouncement, getAnnouncements, getMatches, getEvents
} from "@/lib/queries";
import { RecruitmentBadge, MatchStatusBadge, EventStatusBadge, EventTypeBadge } from "@/components/ui/Badges";
import { formatDate, formatTime, whatsappLink, initials } from "@/lib/utils";
import { AnnouncementCard } from "@/components/ui/AnnouncementCard";
import { MatchCard } from "@/components/ui/MatchCard";
import { EventCard } from "@/components/ui/EventCard";

export default async function Home() {
  const [settings, nextMatch, nextEvent, latestAnnouncement, allMatches, allEvents] = await Promise.all([
    getSettings(),
    getNextUpcomingMatch(),
    getNextUpcomingEvent(),
    getLatestAnnouncement(),
    getMatches(),
    getEvents()
  ]);

  const clanName = settings?.clan_name || "Clan";
  const desc = settings?.clan_description || "";
  const wa = settings?.whatsapp_contact || "";
  const recStatus = settings?.recruitment_status || "open";
  const logo = settings?.clan_logo;

  const visibleMatches = allMatches
    .filter((m) => m.status !== "completed" && m.status !== "cancelled")
    .slice(0, 3);
  const visibleEvents = allEvents
    .filter((e) => e.status !== "completed" && e.status !== "cancelled")
    .slice(0, 3);
  const announcements = await getAnnouncements(3);

  return (
    <div className="animate-fadeIn">
      {/* Hero */}
      <section className="relative overflow-hidden grid-bg">
        <div className="container-x py-16 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <RecruitmentBadge status={recStatus} />
              <h1 className="mt-4 font-display text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                <span className="text-white">{clanName}</span>
                <br />
                <span className="bg-gradient-to-r from-brand to-accent-cyan bg-clip-text text-transparent">
                  Night Gathers, Our Watch Begins
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-base text-muted sm:text-lg">
                {desc}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/tryouts" className="btn-primary animate-pulseGlow">
                  Join the Clan
                </Link>
                <Link href="/matches" className="btn-secondary">
                  View Matches
                </Link>
                <a
                  href={whatsappLink(wa, `Hi ${clanName}, I want to join!`)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-whatsapp"
                >
                  WhatsApp Admin
                </a>
              </div>

              <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                <div className="card p-4">
                  <div className="text-2xl font-black font-display">{allMatches.filter(m=>m.status!=="completed" && m.status!=="cancelled").length}</div>
                  <div className="text-xs text-muted">Matches</div>
                </div>
                <div className="card p-4">
                  <div className="text-2xl font-black font-display">{allEvents.filter(e=>e.status!=="completed" && e.status!=="cancelled").length}</div>
                  <div className="text-xs text-muted">Events</div>
                </div>
                <div className="card p-4">
                  <div className="text-2xl font-black font-display">{announcements.length}</div>
                  <div className="text-xs text-muted">Announcements</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {nextMatch && (
                <div className="card hover:border-brand/40">
                  <div className="flex items-center justify-between">
                    <span className="badge border-brand/40 bg-brand/10 text-brand text-[11px]">
                      NEXT MATCH
                    </span>
                    <MatchStatusBadge status={nextMatch.status} />
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold">{nextMatch.title}</h3>
                  <p className="mt-1 text-sm text-muted">{nextMatch.game_mode}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Date</div>
                      <div className="font-medium">{formatDate(nextMatch.match_date)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Time</div>
                      <div className="font-medium">{formatTime(nextMatch.start_time)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Prize</div>
                      <div className="font-medium text-accent">{nextMatch.prize || "—"}</div>
                    </div>
                  </div>
                  <Link href={`/matches/${nextMatch.id}`} className="mt-5 btn-outline w-full">
                    View match
                  </Link>
                </div>
              )}

              {nextEvent && (
                <div className="card hover:border-accent-cyan/40">
                  <div className="flex items-center justify-between">
                    <EventTypeBadge type={nextEvent.event_type} />
                    <EventStatusBadge status={nextEvent.status} />
                  </div>
                  <h3 className="mt-3 font-display text-2xl font-bold">{nextEvent.title}</h3>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{nextEvent.description}</p>
                  <div className="mt-4 flex flex-wrap gap-4 text-sm">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Date</div>
                      <div className="font-medium">{formatDate(nextEvent.event_date)}</div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-gray-500">Time</div>
                      <div className="font-medium">{formatTime(nextEvent.start_time)}</div>
                    </div>
                  </div>
                  <Link href={`/events/${nextEvent.id}`} className="mt-5 btn-secondary w-full">
                    View event
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Latest announcement */}
      {latestAnnouncement && (
        <section className="container-x py-10">
          <div className="flex items-end justify-between mb-4">
            <div>
              <div className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Latest</div>
              <h2 className="section-title">Announcement</h2>
            </div>
            <Link href="/announcements" className="text-sm text-muted hover:text-white">All announcements →</Link>
          </div>
          <AnnouncementCard a={latestAnnouncement} />
        </section>
      )}

      {/* Upcoming matches */}
      <section className="container-x py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-brand font-semibold">Upcoming</div>
            <h2 className="section-title">Matches</h2>
          </div>
          <Link href="/matches" className="text-sm text-muted hover:text-white">All matches →</Link>
        </div>
        {visibleMatches.length === 0 ? (
          <div className="card text-center py-10 text-muted">No upcoming matches yet.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleMatches.map((m) => (
              <MatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* Upcoming events */}
      <section className="container-x py-10">
        <div className="flex items-end justify-between mb-5">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-accent-cyan font-semibold">Upcoming</div>
            <h2 className="section-title">Events</h2>
          </div>
          <Link href="/events" className="text-sm text-muted hover:text-white">All events →</Link>
        </div>
        {visibleEvents.length === 0 ? (
          <div className="card text-center py-10 text-muted">No upcoming events yet.</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleEvents.map((e) => (
              <EventCard key={e.id} event={e} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container-x py-14">
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-brand/20 via-transparent to-accent-cyan/10" />
          <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <h3 className="font-display text-2xl font-bold">Think you've got what it takes?</h3>
              <p className="mt-2 text-muted">
                Applications are {recStatus}. Join the family and climb the ranks with us.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/tryouts" className="btn-primary">Apply Now</Link>
              <a href={whatsappLink(wa, "I want to ask about tryouts.")} target="_blank" rel="noreferrer" className="btn-whatsapp">
                Ask About Tryouts
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
