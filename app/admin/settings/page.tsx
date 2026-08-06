// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getSettings } from "@/lib/queries";
import AdminSettingsClient from "@/components/admin/AdminSettingsClient";

export default async function Page() {
  const s = await getSettings();
  return <AdminSettingsClient settings={s} />;
}
