// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getMatches, getMatchRegistrations } from "@/lib/queries";
import AdminMatchesPageClient from "@/components/admin/AdminMatchesClient";

export default async function AdminMatchesPage() {
  const matches = await getMatches();
  const counts: Record<string, number> = {};
  const regs: Record<string, Awaited<ReturnType<typeof getMatchRegistrations>>> = {};
  for (const m of matches) {
    const r = await getMatchRegistrations(m.id);
    regs[m.id] = r;
    counts[m.id] = r.length;
  }
  const sorted = [...matches].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime());
  return <AdminMatchesPageClient matches={sorted} counts={counts} registrations={regs} />;
}
