// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getApplications } from "@/lib/queries";
import AdminAppsClient from "@/components/admin/AdminAppsClient";

export default async function AdminAppsPage() {
  const apps = await getApplications();
  return <AdminAppsClient applications={apps} />;
}
