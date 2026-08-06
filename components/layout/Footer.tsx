import Link from "next/link";
import Image from "next/image";
import type { Settings } from "@/lib/types";
import { whatsappLink } from "@/lib/utils";

export default function Footer({ settings, clanName }: { settings: Settings | null; clanName?: string }) {
  const clan = settings?.clan_name || clanName || "Night's Watch";
  const wa = settings?.whatsapp_contact || "";
  const socials = settings?.social_links ?? {};
  const logo = settings?.clan_logo;

  return (
    <footer className="border-t border-bg-border/70 bg-bg-soft/40">
      <div className="divider-rune" />
      <div className="container-x py-10 grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full shadow-neo-sm ring-1 ring-white/10">
              {logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={logo} alt={clan} className="h-full w-full object-cover" />
              ) : (
                <Image src="/crest-badge.png" alt={`${clan} crest`} fill sizes="44px" className="object-cover" />
              )}
            </div>
            <div className="font-display text-xl font-bold text-ice-soft">{clan}</div>
          </div>
          <p className="mt-3 text-sm text-muted max-w-sm">
            {settings?.clan_description?.slice(0, 160) ||
              "Official clan hub for matches, events, tryouts and community."}
          </p>
          <p className="mt-3 text-xs italic text-bronze">
            "Night gathers, and now our watch begins."
          </p>
        </div>
        <div>
          <div className="font-display text-sm font-semibold uppercase tracking-wider text-gray-300">Explore</div>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li><Link href="/matches" className="hover:text-white">Matches</Link></li>
            <li><Link href="/events" className="hover:text-white">Events</Link></li>
            <li><Link href="/tryouts" className="hover:text-white">Tryouts</Link></li>
            <li><Link href="/members" className="hover:text-white">Members</Link></li>
          </ul>
        </div>
        <div>
          <div className="font-display text-sm font-semibold uppercase tracking-wider text-gray-300">Contact</div>
          <div className="mt-3 space-y-3">
            <a
              href={whatsappLink(wa, "Hi! I want to know more about the clan.")}
              target="_blank"
              rel="noreferrer"
              className="btn-whatsapp text-sm w-full sm:w-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.2 1.6 6L0 24l6.3-1.7c1.8 1 3.8 1.5 5.7 1.5h.001c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.4-8.4zM12 21.8h-.001c-1.8 0-3.6-.5-5.1-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 1 1 8.4 4.6zm5.5-7.5c-.3-.1-1.8-.9-2-1s-.4-.1-.6.1-.7.9-.9 1.1-.3.2-.6.1-1.3-.5-2.4-1.5a9.1 9.1 0 0 1-1.7-2.1c-.2-.3 0-.4.1-.5l.4-.5c.1-.2.2-.3.3-.5s0-.4 0-.6-.7-1.7-.9-2.3c-.2-.6-.5-.5-.6-.5h-.5c-.2 0-.5.1-.8.4s-1 1-1 2.5 1 2.9 1.1 3.1c.1.2 2.2 3.4 5.3 4.7.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.5.2-.7.2-1.3.1-1.5 0-.1-.3-.2-.5-.3z"/>
              </svg>
              WhatsApp Admin
            </a>
            <div className="flex flex-wrap gap-2">
              {Object.entries(socials).map(([k, v]) =>
                v ? (
                  <a
                    key={k}
                    href={v}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-md border border-bg-border px-3 py-1.5 text-xs capitalize hover:bg-bg-card"
                  >
                    {k}
                  </a>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-bg-border/70 py-4 text-center text-xs text-muted">
        &copy; {new Date().getFullYear()} {clan}. Built for the Blood Strike community.
      </div>
    </footer>
  );
}
