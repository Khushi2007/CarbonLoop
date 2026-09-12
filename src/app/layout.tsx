import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CarbonLoop",
  description: "GIS-Powered Waste-to-Carbon-Value Chain Tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
