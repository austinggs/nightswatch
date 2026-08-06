// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getMatches, getMatchRegistrations } from "@/lib/queries";
import { MatchCard } from "@/components/ui/MatchCard";
import { EmptyState } from "@/components/ui/Common";
import Link from "next/link";

export const metadata = { title: "Matches — Clan Hub" };

export default async function MatchesPage() {
  const matches = await getMatches();

  const upcoming = matches.filter((m) => m.status !== "completed" && m.status !== "cancelled");
  const past = matches.filter((m) => m.status === "completed" || m.status === "cancelled");

  const counts = new Map<string, number>();
  for (const m of matches) {
    const regs = await getMatchRegistrations(m.id);
    counts.set(m.id, regs.length);
  }

  return (
    <div className="container-x py-10 animate-fadeIn">
      <div className="mb-8">
        <h1 className="section-title">Matches</h1>
        <p className="mt-2 text-sm text-muted">Browse upcoming clan matches and register to play.</p>
      </div>

      <div className="mb-10">
        <h2 className="font-display text-xl font-bold mb-4">
          Upcoming <span className="text-muted font-normal text-sm">({upcoming.length})</span>
        </h2>
        {upcoming.length === 0 ? (
          <EmptyState
            title="No upcoming matches"
            description="Check back soon or follow announcements for the next match date."
            action={<Link href="/announcements" className="btn-secondary">View announcements</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} registerCount={counts.get(m.id)} />
            ))}
          </div>
        )}
      </div>

      {past.length > 0 && (
        <div>
          <h2 className="font-display text-xl font-bold mb-4">
            Recent <span className="text-muted font-normal text-sm">({past.length})</span>
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {past.slice(0, 9).map((m) => (
              <MatchCard key={m.id} match={m} registerCount={counts.get(m.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
