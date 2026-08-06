"use client";

import { PageHeader, useAdminForm, ConfirmWrapper } from "@/components/admin/AdminCommon";
import { EmptyState } from "@/components/ui/Common";
import { formatDate, initials } from "@/lib/utils";
import type { UserProfile } from "@/lib/types";

export default function AdminAccessClient({
  profiles, currentUserId
}: { profiles: UserProfile[]; currentUserId: string | null }) {
  const { submit, confirm, setConfirm } = useAdminForm();

  const adminCount = profiles.filter((p) => p.role === "admin").length;

  const toggleRole = (p: UserProfile) => {
    const nextRole = p.role === "admin" ? "user" : "admin";
    if (nextRole === "user") {
      setConfirm({
        title: `Remove admin access from ${p.email}?`,
        description:
          p.id === currentUserId
            ? "This is your own account — you will immediately lose access to the admin dashboard."
            : "They will no longer be able to sign in to the admin dashboard.",
        danger: true,
        onConfirm: async () => {
          await submit("PATCH", `/api/admin/users/${p.id}`, { role: nextRole }, "Admin access removed.");
        }
      });
    } else {
      submit("PATCH", `/api/admin/users/${p.id}`, { role: nextRole }, `${p.email} is now an admin.`);
    }
  };

  return (
    <>
      <PageHeader
        title="Access"
        description="Grant or revoke admin dashboard access. This is separate from a member's clan rank."
      />

      <div className="mb-5 rounded-xl border border-accent/20 bg-accent/5 px-4 py-3 text-sm text-accent">
        Heads up — this list only shows people who have created an account (signed up). Setting someone's{" "}
        <span className="font-semibold">clan rank</span> to "Admin" on the Members page is just a roster title
        and does <span className="font-semibold">not</span> grant dashboard access. Use this page instead.
      </div>

      {profiles.length === 0 ? (
        <EmptyState title="No accounts yet" description="No one has signed up for an account yet." />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wider text-muted bg-bg border-b border-bg-border">
                  <th className="py-3 px-4">Account</th>
                  <th className="py-3 px-4">Joined</th>
                  <th className="py-3 px-4">Access</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-bg-border/70">
                {profiles.map((p) => (
                  <tr key={p.id} className="hover:bg-bg-soft/40">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="neo-tile flex h-9 w-9 shrink-0 items-center justify-center font-bold text-xs text-ice">
                          {initials(p.email)}
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold truncate">{p.email}</div>
                          {p.id === currentUserId && <div className="text-[11px] text-muted">This is you</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-muted text-xs">{formatDate(p.created_at)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          p.role === "admin"
                            ? "badge border-brand/30 bg-brand/10 text-brand"
                            : "badge border-gray-500/30 bg-gray-500/10 text-gray-300"
                        }
                      >
                        {p.role === "admin" ? "Admin" : "Member account"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={() => toggleRole(p)}
                        disabled={p.role === "admin" && adminCount <= 1}
                        title={p.role === "admin" && adminCount <= 1 ? "Can't remove the last admin" : undefined}
                        className={
                          p.role === "admin"
                            ? "text-xs text-red-400 hover:underline disabled:opacity-40 disabled:no-underline disabled:cursor-not-allowed"
                            : "text-xs text-brand hover:underline"
                        }
                      >
                        {p.role === "admin" ? "Remove admin" : "Make admin"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ConfirmWrapper confirm={confirm} onCancel={() => setConfirm(null)} />
    </>
  );
}
