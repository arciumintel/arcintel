import Link from "next/link";
import { Settings } from "lucide-react";
import type { ReactNode } from "react";

type StaffProgramShellProps = {
  orgSlug: string;
  programSlug: string;
  orgName: string;
  programTitle: string;
  active: "overview" | "curriculum" | "settings";
  children: ReactNode;
};

const navItems = [
  { key: "overview" as const, label: "Overview", segment: "" },
  { key: "curriculum" as const, label: "Curriculum", segment: "/curriculum" },
];

function navHref(orgSlug: string, programSlug: string, segment: string) {
  return `/staff/organizations/${orgSlug}/programs/${programSlug}${segment}`;
}

export default function StaffProgramShell({
  orgSlug,
  programSlug,
  orgName,
  programTitle,
  active,
  children,
}: StaffProgramShellProps) {
  const base = navHref(orgSlug, programSlug, "");

  return (
    <div className="mx-auto flex w-full max-w-[1440px] gap-10 px-5 py-10 md:px-8">
      <aside className="hidden w-[220px] shrink-0 md:block">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          Program workspace
        </p>
        <p className="mt-1 font-sans text-[0.82rem] text-ink-muted">{orgName}</p>
        <nav className="mt-8 space-y-1" aria-label="Program">
          {navItems.map((item) => {
            const href = navHref(orgSlug, programSlug, item.segment);
            const isActive = active === item.key;
            return (
              <Link
                key={item.key}
                href={href}
                className={`block border-l-4 px-3 py-2 font-sans text-[0.9rem] transition-colors ${
                  isActive
                    ? "border-sage bg-sage-soft text-ink"
                    : "border-transparent text-ink-muted hover:border-rule hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-10 border-t border-rule pt-6">
          <Link
            href={navHref(orgSlug, programSlug, "/settings")}
            className={`inline-flex items-center gap-2 font-sans text-[0.88rem] ${
              active === "settings" ? "text-ink" : "text-ink-muted hover:text-ink"
            }`}
          >
            <Settings className="h-4 w-4" aria-hidden />
            Settings
          </Link>
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <nav className="mb-4 font-sans text-[0.82rem] text-ink-soft" aria-label="Breadcrumb">
          <Link href={`/staff/organizations/${orgSlug}`} className="hover:text-ink">
            {orgName}
          </Link>
          <span className="mx-2">/</span>
          <Link href={`/staff/organizations/${orgSlug}`} className="hover:text-ink">
            Programs
          </Link>
          <span className="mx-2">/</span>
          <Link href={base} className="hover:text-ink">
            {programTitle}
          </Link>
        </nav>
        {children}
      </div>
    </div>
  );
}
