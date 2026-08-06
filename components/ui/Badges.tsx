import { cn } from "@/lib/utils";
import type { MatchStatus, EventStatus, ApplicationStatus, ClanRole, RecruitmentStatus } from "@/lib/types";

export function MatchStatusBadge({ status }: { status: MatchStatus }) {
  const map: Record<MatchStatus, { label: string; cls: string }> = {
    registration_open: { label: "Registration Open", cls: "border-green-500/30 bg-green-500/10 text-green-400" },
    full: { label: "Full", cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    upcoming: { label: "Upcoming", cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
    completed: { label: "Completed", cls: "border-gray-500/30 bg-gray-500/10 text-gray-400" },
    cancelled: { label: "Cancelled", cls: "border-red-500/30 bg-red-500/10 text-red-400" }
  };
  const s = map[status];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return <MatchStatusBadge status={status as MatchStatus} />;
}

export function AppStatusBadge({ status }: { status: ApplicationStatus }) {
  const map: Record<ApplicationStatus, { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    reviewing: { label: "Reviewing", cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
    tryout: { label: "Tryout", cls: "border-purple-500/30 bg-purple-500/10 text-purple-400" },
    accepted: { label: "Accepted", cls: "border-green-500/30 bg-green-500/10 text-green-400" },
    rejected: { label: "Rejected", cls: "border-red-500/30 bg-red-500/10 text-red-400" }
  };
  const s = map[status];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

export function RoleBadge({ role }: { role: ClanRole }) {
  const map: Record<ClanRole, { label: string; cls: string }> = {
    owner: { label: "Owner", cls: "border-red-500/30 bg-red-500/10 text-red-400" },
    admin: { label: "Admin", cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    moderator: { label: "Moderator", cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
    member: { label: "Member", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" },
    trial: { label: "Trial Member", cls: "border-gray-500/30 bg-gray-500/10 text-gray-300" }
  };
  const s = map[role];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

export function RecruitmentBadge({ status }: { status: RecruitmentStatus }) {
  const map: Record<RecruitmentStatus, { label: string; cls: string }> = {
    open: { label: "Recruiting Now", cls: "border-green-500/30 bg-green-500/10 text-green-400" },
    limited: { label: "Limited Spots", cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    closed: { label: "Closed", cls: "border-red-500/30 bg-red-500/10 text-red-400" }
  };
  const s = map[status];
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}

export function EventTypeBadge({ type }: { type: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    tournament: { label: "Tournament", cls: "border-yellow-500/30 bg-yellow-500/10 text-yellow-400" },
    scrim: { label: "Scrim", cls: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400" },
    giveaway: { label: "Giveaway", cls: "border-pink-500/30 bg-pink-500/10 text-pink-400" },
    training: { label: "Training", cls: "border-blue-500/30 bg-blue-500/10 text-blue-400" },
    clan_event: { label: "Clan Event", cls: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400" }
  };
  const s = map[type] || { label: type, cls: "border-gray-500/30 bg-gray-500/10 text-gray-300" };
  return <span className={cn("badge", s.cls)}>{s.label}</span>;
}
