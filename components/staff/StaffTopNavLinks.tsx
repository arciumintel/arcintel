"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/staff/organizations", label: "Organizations", match: (p: string) => p.startsWith("/staff/organizations") },
  { href: "/staff/organizations", label: "Programs", match: (p: string) => p.includes("/programs") },
] as const;

export default function StaffTopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-6" aria-label="Staff">
      {links.map((link) => {
        const active = link.match(pathname);
        return (
          <Link
            key={link.label}
            href={link.href}
            className={`font-sans text-[0.88rem] transition-colors ${
              active
                ? "border-b-2 border-accent pb-0.5 text-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
