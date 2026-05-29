import Link from "next/link";
import StaffTopNavLinks from "./StaffTopNavLinks";

export default function StaffTopNav() {
  return (
    <header className="border-b border-rule bg-paper-deep">
      <div className="mx-auto flex h-14 max-w-[1440px] items-center justify-between gap-6 px-5 md:px-8">
        <Link href="/staff/organizations" className="flex items-baseline gap-2">
          <span className="font-sans text-[0.95rem] font-semibold tracking-tight text-ink">
            Arcademy
          </span>
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
            Staff Studio
          </span>
        </Link>
        <StaffTopNavLinks />
      </div>
    </header>
  );
}
