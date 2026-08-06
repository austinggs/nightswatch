// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getEvents, getEventRegistrations } from "@/lib/queries";
import AdminEventsPageClient from "@/components/admin/AdminEventsClient";

export default async function AdminEventsPage() {
  const events = await getEvents();
  const counts: Record<string, number> = {};
  const regs: Record<string, Awaited<ReturnType<typeof getEventRegistrations>>> = {};
  for (const e of events) {
    const r = await getEventRegistrations(e.id);
    regs[e.id] = r;
    counts[e.id] = r.length;
  }
  const sorted = [...events].sort((a, b) => new Date(b.event_date).getTime() - new Date(a.event_date).getTime());
  return <AdminEventsPageClient events={sorted} counts={counts} registrations={regs} />;
}
