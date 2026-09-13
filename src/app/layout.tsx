import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentCarbonLoopUser } from "@/lib/auth/session";
import { THEME_STORAGE_KEY } from "@/lib/theme";

import "./globals.css";

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CarbonLoop",
  description: "GIS-Powered Waste-to-Carbon-Value Chain Tracker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authResult = await getCurrentCarbonLoopUser();
  const currentUser = authResult.ok ? { name: authResult.user.name, role: authResult.user.role } : null;

  return (
    <html lang="en" className={`${sourceSerif.variable} ${plexMono.variable}`} suppressHydrationWarning>
      <head>
        {/*
          Applies a previously-saved dark-mode choice to <html> before the
          page paints, so there is no flash of the wrong theme. This must
          run synchronously and before hydration, which is why it is a plain
          inline script rather than a React effect. A fresh visit with no
          saved preference intentionally leaves the attribute unset (light,
          the default) — this never reads prefers-color-scheme.
          suppressHydrationWarning above accounts for the one attribute this
          script adds that the server-rendered HTML cannot know in advance.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem(${JSON.stringify(
              THEME_STORAGE_KEY
            )})==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`,
          }}
        />
      </head>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader currentUser={currentUser} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
