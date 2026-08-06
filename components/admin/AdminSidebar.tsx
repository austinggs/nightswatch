"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin",              label: "Overview",    icon: "◉" },
  { href: "/admin/matches",      label: "Matches",     icon: "⚔" },
  { href: "/admin/events",       label: "Events",      icon: "♛" },
  { href: "/admin/applications", label: "Applications",icon: "✉" },
  { href: "/admin/members",      label: "Members",     icon: "♞" },
  { href: "/admin/announcements",label: "Announcements", icon: "📣" },
  { href: "/admin/access",       label: "Access",      icon: "🛡" },
  { href: "/admin/settings",     label: "Settings",    icon: "⚙" }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const isActive = (h: string) => (h === "/admin" ? pathname === "/admin" : pathname?.startsWith(h));

  return (
    <aside className="lg:w-60 shrink-0">
      <div className="card p-3 lg:sticky lg:top-24">
        <div className="px-2 py-2">
          <div className="text-[10px] uppercase tracking-[0.2em] text-muted font-semibold">Admin</div>
          <div className="font-display text-lg font-bold">Dashboard</div>
        </div>
        <nav className="mt-2 flex flex-row gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition",
                isActive(n.href)
                  ? "bg-brand/15 text-brand border border-brand/30"
                  : "text-gray-300 hover:bg-bg-soft hover:text-white"
              )}
            >
              <span className="w-5 text-center">{n.icon}</span>
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 border-t border-bg-border pt-3 px-2 flex gap-2">
          <Link href="/" className="btn-ghost text-xs flex-1">View site ↗</Link>
        </div>
      </div>
    </aside>
  );
}
