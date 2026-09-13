import type { Metadata } from "next";
import { IBM_Plex_Mono, Source_Serif_4 } from "next/font/google";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getCurrentCarbonLoopUser } from "@/lib/auth/session";

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
    <html lang="en" className={`${sourceSerif.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-background text-foreground">
        <SiteHeader currentUser={currentUser} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
