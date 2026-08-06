import type { Member } from "@/lib/types";
import { RoleBadge } from "./Badges";
import { formatDate, initials } from "@/lib/utils";

export function MemberCard({ m }: { m: Member }) {
  return (
    <article className="card animate-fadeIn flex items-start gap-4 hover:border-brand/30 transition-colors">
      <div className="relative">
        {m.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.avatar_url} alt={m.username} className="h-14 w-14 rounded-xl object-cover border border-bg-border" />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-brand/40 to-red-700/40 font-display text-lg font-bold">
            {initials(m.username)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="font-display font-bold truncate">{m.username}</h4>
          <RoleBadge role={m.role} />
        </div>
        <div className="mt-1 text-xs text-muted">
          UID: <span className="text-gray-300">{m.blood_strike_uid}</span>
        </div>
        <div className="mt-1 text-xs text-muted">
          Mode: <span className="text-gray-300">{m.preferred_mode}</span>
        </div>
        <div className="mt-1 text-[11px] text-gray-500">
          Joined {formatDate(m.join_date)}
        </div>
      </div>
    </article>
  );
}
