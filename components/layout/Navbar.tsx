"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useSupabase } from "@/components/providers/SupabaseProvider";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Home" },
  { href: "/matches", label: "Matches" },
  { href: "/events", label: "Events" },
  { href: "/tryouts", label: "Tryouts" },
  { href: "/members", label: "Members" }
];

export default function Navbar({ clanName, clanLogo }: { clanName: string; clanLogo?: string | null }) {
  const pathname = usePathname();
  const router = useRouter();
  const { supabase, user, role } = useSupabase();
  const [menu, setMenu] = useState(false);

  const signOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
    setMenu(false);
  };

  const isAdmin = role === "admin";
  const inAdmin = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 border-b border-bg-border/70 bg-bg/85 backdrop-blur-md">
      <div className="container-x flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-neo-sm ring-1 ring-white/10">
            {clanLogo ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={clanLogo} alt={clanName} className="h-full w-full object-cover" />
            ) : (
              <Image
                src="/crest-badge.png"
                alt={`${clanName} crest`}
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            )}
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-bold tracking-wide sm:text-lg text-ice-soft">{clanName}</div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-muted">Clan Hub</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                "rounded-md px-3 py-2 text-sm font-medium transition",
                pathname === l.href
                  ? "text-white bg-bg-soft"
                  : "text-gray-300 hover:text-white hover:bg-bg-soft/60"
              )}
            >
              {l.label}
            </Link>
          ))}
          {isAdmin && (
            <Link
              href="/admin"
              className={cn(
                "rounded-md px-3 py-2 text-sm font-semibold transition",
                inAdmin
                  ? "text-white bg-brand/15 text-brand border border-brand/30"
                  : "text-gray-300 hover:text-white hover:bg-bg-soft/60"
              )}
            >
              Admin
            </Link>
          )}
          <Link href="/tryouts" className="ml-2 btn-primary text-xs sm:text-sm">
            Join the Clan
          </Link>
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="text-xs text-muted truncate max-w-[140px]">{user.email}</div>
              <button onClick={signOut} className="btn-secondary text-xs">Sign out</button>
            </div>
          ) : (
            <Link href="/auth/sign-in" className="btn-ghost text-xs">Sign in</Link>
          )}
        </div>

        <button
          onClick={() => setMenu(!menu)}
          className="rounded-md p-2 text-gray-300 hover:bg-bg-soft md:hidden"
          aria-label="Menu"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {menu ? <path d="M18 6L6 18M6 6l12 12"/> : <><path d="M3 6h18"/><path d="M3 12h18"/><path d="M3 18h18"/></>}
          </svg>
        </button>
      </div>

      {menu && (
        <div className="border-t border-bg-border md:hidden">
          <div className="container-x py-3 space-y-1">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMenu(false)}
                className={cn(
                  "block rounded-md px-3 py-2 text-sm font-medium",
                  pathname === l.href ? "text-white bg-bg-soft" : "text-gray-300 hover:bg-bg-soft/60"
                )}
              >
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setMenu(false)}
                className="block rounded-md px-3 py-2 text-sm font-semibold text-brand"
              >
                Admin Dashboard
              </Link>
            )}
            <div className="pt-2 flex flex-col gap-2">
              <Link href="/tryouts" onClick={() => setMenu(false)} className="btn-primary w-full">
                Join the Clan
              </Link>
              {user ? (
                <button onClick={signOut} className="btn-secondary w-full">
                  Sign out ({user.email?.slice(0, 24)})
                </button>
              ) : (
                <Link href="/auth/sign-in" onClick={() => setMenu(false)} className="btn-secondary w-full">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
