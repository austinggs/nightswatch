// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getMatchById, getMatchRegistrations, isUserRegisteredForMatch, getSettings
} from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import { MatchStatusBadge } from "@/components/ui/Badges";
import { formatDate, formatTime, whatsappLink, isPast } from "@/lib/utils";
import { RegisterMatchForm } from "@/components/matches/RegisterMatchForm";

export default async function MatchDetailPage({ params }: { params: { id: string } }) {
  const match = await getMatchById(params.id);
  if (!match) return notFound();

  const [regs, settings, user] = await Promise.all([
    getMatchRegistrations(params.id),
    getSettings(),
    getCurrentUser()
  ]);
  const registered = user ? await isUserRegisteredForMatch(params.id, user.id) : false;

  const slots = match.player_limit || 0;
  const deadlinePast = isPast(match.registration_deadline, "23:59");
  const canRegister =
    !!user &&
    !registered &&
    !deadlinePast &&
    regs.length < slots &&
    match.status !== "cancelled" &&
    match.status !== "completed" &&
    match.status !== "full";

  const showRoom = match.room_published && !!user && registered;

  return (
    <div className="container-x py-10 animate-fadeIn max-w-4xl">
      <Link href="/matches" className="text-sm text-muted hover:text-white">← Back to matches</Link>

      <div className="mt-4 card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold">{match.title}</h1>
            <div className="mt-1 text-muted">{match.game_mode}</div>
          </div>
          <MatchStatusBadge status={match.status} />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Date" value={formatDate(match.match_date)} />
          <Stat label="Start Time" value={formatTime(match.start_time)} />
          <Stat label="Registration Deadline" value={formatDate(match.registration_deadline)} />
          <Stat label="Slots" value={`${regs.length} / ${slots}`} />
        </div>

        {match.prize && (
          <div className="mt-5 rounded-lg bg-bg border border-bg-border px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-gray-500">Prize / Reward</div>
            <div className="mt-1 font-semibold text-accent">{match.prize}</div>
          </div>
        )}

        <div className="mt-6 grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-6">
            {match.rules ? (
              <div>
                <h3 className="font-display font-bold mb-2">Rules</h3>
                <div className="whitespace-pre-wrap text-sm text-muted rounded-lg bg-bg p-4 border border-bg-border">
                  {match.rules}
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted">No rules posted yet.</div>
            )}

            {showRoom && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/5 p-4">
                <h3 className="font-display font-bold text-green-400">Room Information</h3>
                <p className="text-xs text-green-300/80 mt-1">Published by admins. Do not share publicly.</p>
                <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-[10px] uppercase text-gray-400">Room ID</div>
                    <div className="font-mono font-semibold">{match.room_id || "—"}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-gray-400">Password</div>
                    <div className="font-mono font-semibold">{match.room_password || "—"}</div>
                  </div>
                </div>
              </div>
            )}

            {user && registered && !match.room_published && (
              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-300">
                You're registered! Room ID / password will be published here by admins closer to match time.
              </div>
            )}
          </div>

          <aside className="md:col-span-2 space-y-4">
            <div className="card !p-4">
              <h3 className="font-display font-bold mb-3">Registration</h3>
              {!user && (
                <div className="space-y-3">
                  <p className="text-sm text-muted">Sign in to register for this match.</p>
                  <Link href={`/auth/sign-in?next=${encodeURIComponent(`/matches/${match.id}`)}`} className="btn-primary w-full">
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
                <RegisterMatchForm
                  matchId={match.id}
                  canRegister={canRegister}
                  reason={
                    deadlinePast ? "Registration deadline passed."
                    : match.status === "full" ? "Match is full."
                    : match.status === "cancelled" ? "Match cancelled."
                    : match.status === "completed" ? "Match completed."
                    : regs.length >= slots ? "No slots available."
                    : null
                  }
                />
              )}
              <a
                href={whatsappLink(settings?.whatsapp_contact || "", `Hi! I have a question about ${match.title}.`)}
                target="_blank" rel="noreferrer"
                className="btn-whatsapp w-full mt-3 text-sm"
              >
                Contact Match Host
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
