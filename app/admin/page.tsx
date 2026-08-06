// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import {
  getAllMembersAdmin, getMatches, getEvents, getApplications, getAnnouncements, getMatchRegistrations, getEventRegistrations
} from "@/lib/queries";
import Link from "next/link";
import { AppStatusBadge, MatchStatusBadge, EventStatusBadge, RoleBadge } from "@/components/ui/Badges";
import { formatDate, initials } from "@/lib/utils";

export default async function AdminOverview() {
  const [members, matches, events, applications, announcements] = await Promise.all([
    getAllMembersAdmin(),
    getMatches(),
    getEvents(),
    getApplications(),
    getAnnouncements(5)
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const upcomingMatches = matches.filter((m) => m.match_date >= today && m.status !== "completed" && m.status !== "cancelled").slice(0, 5);
  const upcomingEvents = events.filter((e) => e.event_date >= today && e.status !== "completed" && e.status !== "cancelled").slice(0, 5);
  const pendingApps = applications.filter((a) => a.status === "pending" || a.status === "reviewing");

  const matchRegCounts = new Map<string, number>();
  for (const m of upcomingMatches) {
    const regs = await getMatchRegistrations(m.id);
    matchRegCounts.set(m.id, regs.length);
  }
  const eventRegCounts = new Map<string, number>();
  for (const e of upcomingEvents) {
    const regs = await getEventRegistrations(e.id);
    eventRegCounts.set(e.id, regs.length);
  }

  const stats = [
    { label: "Total Members", value: members.length, href: "/admin/members", color: "from-emerald-500/20 to-emerald-500/0 border-emerald-500/30" },
    { label: "Pending Applications", value: pendingApps.length, href: "/admin/applications", color: "from-yellow-500/20 to-yellow-500/0 border-yellow-500/30" },
    { label: "Upcoming Matches", value: upcomingMatches.length, href: "/admin/matches", color: "from-brand/20 to-brand/0 border-brand/30" },
    { label: "Upcoming Events", value: upcomingEvents.length, href: "/admin/events", color: "from-cyan-500/20 to-cyan-500/0 border-cyan-500/30" }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Overview</h1>
        <p className="text-sm text-muted">A quick snapshot of the clan hub.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Link href={s.href} key={s.label} className={`card p-5 hover:shadow-glow transition bg-gradient-to-br ${s.color}`}>
            <div className="text-xs uppercase tracking-wider text-muted">{s.label}</div>
            <div className="mt-2 font-display text-3xl font-black">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Pending Applications</h3>
            <Link href="/admin/applications" className="text-xs text-brand hover:underline">View all →</Link>
          </div>
          {pendingApps.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">No pending applications. 🎉</div>
          ) : (
            <div className="divide-y divide-bg-border">
              {pendingApps.slice(0, 5).map((a) => (
                <div key={a.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{a.nickname}</div>
                    <div className="text-xs text-muted truncate">{a.bs_username} · UID {a.bs_uid}</div>
                  </div>
                  <AppStatusBadge status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Upcoming Matches</h3>
            <Link href="/admin/matches" className="text-xs text-brand hover:underline">Manage →</Link>
          </div>
          {upcomingMatches.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">No upcoming matches.</div>
          ) : (
            <div className="divide-y divide-bg-border">
              {upcomingMatches.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.title}</div>
                    <div className="text-xs text-muted">{formatDate(m.match_date)} · {matchRegCounts.get(m.id) ?? 0}/{m.player_limit} slots</div>
                  </div>
                  <MatchStatusBadge status={m.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Upcoming Events</h3>
            <Link href="/admin/events" className="text-xs text-brand hover:underline">Manage →</Link>
          </div>
          {upcomingEvents.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">No upcoming events.</div>
          ) : (
            <div className="divide-y divide-bg-border">
              {upcomingEvents.map((e) => (
                <div key={e.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{e.title}</div>
                    <div className="text-xs text-muted">{formatDate(e.event_date)} · {eventRegCounts.get(e.id) ?? 0}/{e.participant_limit}</div>
                  </div>
                  <EventStatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Latest Announcements</h3>
            <Link href="/admin/announcements" className="text-xs text-brand hover:underline">Manage →</Link>
          </div>
          {announcements.length === 0 ? (
            <div className="text-sm text-muted py-6 text-center">No announcements yet.</div>
          ) : (
            <div className="divide-y divide-bg-border">
              {announcements.slice(0, 5).map((a) => (
                <div key={a.id} className="py-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{a.title}</div>
                    <div className="text-xs text-muted line-clamp-1">{a.description}</div>
                  </div>
                  <span className="text-[10px] text-muted whitespace-nowrap">{formatDate(a.published_at)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Roster Snapshot</h3>
          <Link href="/admin/members" className="text-xs text-brand hover:underline">Manage →</Link>
        </div>
        {members.length === 0 ? (
          <div className="text-sm text-muted py-6 text-center">No members yet.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {members.slice(0, 6).map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg border border-bg-border bg-bg p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/20 font-bold">
                  {initials(m.username)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold truncate">{m.username}</div>
                  <div className="mt-0.5"><RoleBadge role={m.role} /></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
