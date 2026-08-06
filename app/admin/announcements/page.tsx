// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getAnnouncements, getMatches, getEvents } from "@/lib/queries";
import AdminAnnouncementsClient from "@/components/admin/AdminAnnouncementsClient";

export default async function Page() {
  const [ann, matches, events] = await Promise.all([getAnnouncements(50), getMatches(), getEvents()]);
  return <AdminAnnouncementsClient announcements={ann} matches={matches} events={events} />;
}
