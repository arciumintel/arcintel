import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import PortalShell from "@/components/portal/PortalShell";
import GuestMergeRunner from "@/components/guest/GuestMergeRunner";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Arcademy — Ecosystem onboarding for Arcium",
    template: "%s | Arcademy",
  },
  description:
    "Arcademy is the shared learning checkpoint for the Arcium ecosystem. Partner apps verify user comprehension; learners get one account and a curated catalog of programs.",
  keywords: ["Arcademy", "Arcium", "onboarding", "ecosystem", "learning", "MXE", "confidential compute"],
  openGraph: {
    siteName: "Arcademy",
    type: "website",
    title: "Arcademy — Ecosystem onboarding for Arcium",
    description: "The shared learning checkpoint for the Arcium ecosystem.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`scroll-smooth ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="min-h-screen bg-background font-sans text-ink antialiased selection:bg-accent-soft selection:text-ink">
        <GuestMergeRunner />
        <PortalShell>{children}</PortalShell>
      </body>
    </html>
  );
}
