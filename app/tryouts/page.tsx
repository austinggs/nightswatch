// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getSettings } from "@/lib/queries";
import { RecruitmentBadge } from "@/components/ui/Badges";
import { whatsappLink } from "@/lib/utils";
import { ApplicationForm } from "@/components/tryouts/ApplicationForm";

export const metadata = { title: "Tryouts — Clan Hub" };

export default async function TryoutsPage() {
  const settings = await getSettings();
  const recStatus = settings?.recruitment_status || "open";
  const requirements = settings?.clan_requirements || "";
  const wa = settings?.whatsapp_contact || "";
  const closed = recStatus === "closed";

  return (
    <div className="container-x py-10 animate-fadeIn max-w-5xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="section-title">Join the Clan</h1>
          <p className="mt-2 text-sm text-muted">Fill in the form below to apply. We review every application.</p>
        </div>
        <RecruitmentBadge status={recStatus} />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <aside className="lg:col-span-2 space-y-5">
          <div className="card">
            <h3 className="font-display text-lg font-bold">Requirements</h3>
            {requirements ? (
              <div className="mt-3 whitespace-pre-wrap text-sm text-muted">{requirements}</div>
            ) : (
              <ul className="mt-3 space-y-2 text-sm text-muted list-disc list-inside">
                <li>Active and communicative on WhatsApp</li>
                <li>Willingness to learn and attend trainings</li>
                <li>Respectful attitude toward teammates and opponents</li>
                <li>No history of cheating or toxicity</li>
              </ul>
            )}
          </div>

          <div className="card">
            <h3 className="font-display text-lg font-bold">Recruitment Process</h3>
            <ol className="mt-3 space-y-3 text-sm">
              {[
                ["1", "Application", "We review your profile and experience."],
                ["2", "Tryout match", "You join a scrim/training to show gameplay."],
                ["3", "Trial period", "Short trial as Trial Member."],
                ["4", "Welcome", "Full member access and clan role."]
              ].map(([n, title, desc]) => (
                <li key={n} className="flex gap-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/20 text-brand font-bold text-xs">
                    {n}
                  </div>
                  <div>
                    <div className="font-semibold">{title}</div>
                    <div className="text-muted text-xs mt-0.5">{desc}</div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="card bg-gradient-to-br from-[#25D366]/10 via-transparent to-transparent border-[#25D366]/30">
            <h3 className="font-display text-lg font-bold">Questions?</h3>
            <p className="mt-2 text-sm text-muted">Message an admin directly on WhatsApp.</p>
            <a
              href={whatsappLink(wa, "Hi! I have a question about tryouts.")}
              target="_blank" rel="noreferrer"
              className="btn-whatsapp mt-4 w-full"
            >
              Ask About Tryouts
            </a>
          </div>
        </aside>

        <div className="lg:col-span-3">
          {closed ? (
            <div className="card text-center py-14">
              <div className="text-5xl mb-3">🔒</div>
              <h3 className="font-display text-2xl font-bold">Recruitment is temporarily closed</h3>
              <p className="mt-2 text-muted max-w-md mx-auto">
                We'll reopen applications once spots become available. Follow our announcements for updates.
              </p>
            </div>
          ) : (
            <ApplicationForm />
          )}
        </div>
      </div>
    </div>
  );
}
