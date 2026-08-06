// Always render fresh from the database — see lib/supabase/server.ts for why this was needed.
export const dynamic = "force-dynamic";

import { getApprovedMembers } from "@/lib/queries";
import { MemberCard } from "@/components/ui/MemberCard";
import { EmptyState } from "@/components/ui/Common";
import type { ClanRole } from "@/lib/types";
import { getSettings } from "@/lib/queries";
import { whatsappLink } from "@/lib/utils";
import Link from "next/link";

export const metadata = { title: "Members — Clan Hub" };

const roleOrder: ClanRole[] = ["owner", "admin", "moderator", "member", "trial"];

export default async function MembersPage() {
  const [members, settings] = await Promise.all([getApprovedMembers(), getSettings()]);
  const sorted = [...members].sort(
    (a, b) => roleOrder.indexOf(a.role) - roleOrder.indexOf(b.role)
  );

  const counts = {
    total: members.length,
    owner: members.filter((m) => m.role === "owner").length,
    admin: members.filter((m) => m.role === "admin").length,
    mod: members.filter((m) => m.role === "moderator").length,
    member: members.filter((m) => m.role === "member").length,
    trial: members.filter((m) => m.role === "trial").length
  };

  return (
    <div className="container-x py-10 animate-fadeIn">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="section-title">Clan Members</h1>
          <p className="mt-2 text-sm text-muted">Meet the roster behind the clan.</p>
        </div>
        <a
          href={whatsappLink(settings?.whatsapp_contact || "", "Hi! I'd like to join the clan.")}
          target="_blank" rel="noreferrer"
          className="btn-whatsapp"
        >
          Join Clan WhatsApp
        </a>
      </div>

      <div className="mb-8 grid grid-cols-3 sm:grid-cols-6 gap-3">
        <Stat n={counts.total} label="Total" />
        <Stat n={counts.owner} label="Owner" />
        <Stat n={counts.admin} label="Admin" />
        <Stat n={counts.mod} label="Mods" />
        <Stat n={counts.member} label="Members" />
        <Stat n={counts.trial} label="Trials" />
      </div>

      {sorted.length === 0 ? (
        <EmptyState
          title="No members yet"
          description="The roster is empty. Check back soon!"
          action={<Link href="/" className="btn-secondary">Back home</Link>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((m) => (
            <MemberCard key={m.id} m={m} />
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return (
    <div className="card p-4 text-center">
      <div className="font-display text-2xl font-black">{n}</div>
      <div className="text-xs uppercase tracking-wider text-muted mt-0.5">{label}</div>
    </div>
  );
}
