// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getAnnouncements } from "@/lib/queries";
import { AnnouncementCard } from "@/components/ui/AnnouncementCard";
import { EmptyState } from "@/components/ui/Common";
import Link from "next/link";

export const metadata = { title: "Announcements — Clan Hub" };

export default async function AnnouncementsPage() {
  const list = await getAnnouncements(50);

  return (
    <div className="container-x py-10 animate-fadeIn max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="section-title">Announcements</h1>
        <p className="mt-2 text-sm text-muted">Official clan updates, match news and recruitment posts.</p>
      </div>

      {list.length === 0 ? (
        <EmptyState
          title="No announcements yet"
          description="Nothing posted yet. Check the home page for matches & events."
          action={<Link href="/" className="btn-secondary">Back home</Link>}
        />
      ) : (
        <div className="space-y-5">
          {list.map((a) => (
            <AnnouncementCard key={a.id} a={a} />
          ))}
        </div>
      )}
    </div>
  );
}
