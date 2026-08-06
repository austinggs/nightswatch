// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getAllMembersAdmin } from "@/lib/queries";
import AdminMembersClient from "@/components/admin/AdminMembersClient";

export default async function AdminMembersPage() {
  const members = await getAllMembersAdmin();
  const sorted = [...members].sort(
    (a, b) =>
      ["owner","admin","moderator","member","trial"].indexOf(a.role) -
      ["owner","admin","moderator","member","trial"].indexOf(b.role)
  );
  return <AdminMembersClient members={sorted} />;
}
