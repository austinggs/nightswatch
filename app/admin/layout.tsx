import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = { title: "Admin — Night's Watch" };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // requireAdmin() already redirects appropriately on its own:
  // → /auth/sign-in if not signed in, → / if signed in but not an admin.
  // (Previously this was wrapped in a try/catch that could swallow real
  // configuration errors — e.g. a missing SUPABASE_SERVICE_ROLE_KEY —
  // and silently bounce an actual admin back to the sign-in page with no
  // indication of what went wrong. Letting it throw naturally means a
  // misconfiguration now surfaces as a visible error instead of an
  // endless, unexplained redirect loop.)
  await requireAdmin();

  return (
    <div className="animate-fadeIn">
      <div className="container-x py-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <AdminSidebar />
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
