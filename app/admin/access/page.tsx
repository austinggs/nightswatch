// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getUserProfilesAdmin } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";
import AdminAccessClient from "@/components/admin/AdminAccessClient";

export const metadata = { title: "Admin Access — Night's Watch" };

export default async function AdminAccessPage() {
  const [profiles, me] = await Promise.all([getUserProfilesAdmin(), getCurrentUser()]);
  return <AdminAccessClient profiles={profiles} currentUserId={me?.id ?? null} />;
}
