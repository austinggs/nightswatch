import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { SupabaseProvider } from "@/components/providers/SupabaseProvider";
import { getSettings } from "@/lib/queries";
import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata: Metadata = {
  title: "Night's Watch — Blood Strike Clan Hub",
  description:
    "Official hub for Night's Watch, a Blood Strike clan — matches, events, tryouts and members. Night gathers, and now our watch begins."
};

export default async function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const clanName = settings?.clan_name || "Night's Watch";

  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SupabaseProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar clanName={clanName} clanLogo={settings?.clan_logo || null} />
            <main className="flex-1 pb-16">{children}</main>
            <Footer settings={settings} clanName={clanName} />
          </div>
        </SupabaseProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
