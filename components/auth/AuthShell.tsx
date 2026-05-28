import Link from "next/link";
import type { ReactNode } from "react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  lede: string;
  children: ReactNode;
  footer?: ReactNode;
};

export default function AuthShell({ eyebrow, title, lede, children, footer }: AuthShellProps) {
  return (
    <div className="mx-auto w-full max-w-[520px] pb-32 pt-6 md:pt-10">
      <header className="mb-10 border-b border-ink pb-8">
        <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft">
          {eyebrow}
        </p>
        <h1
          className="font-masthead text-[2.1rem] leading-[0.98] text-ink md:text-[2.6rem]"
          style={{
            fontWeight: 300,
            letterSpacing: "-0.035em",
            fontVariationSettings: "'opsz' 144, 'SOFT' 30",
          }}
        >
          {title}
        </h1>
        <p
          className="mt-5 font-display italic text-[1.05rem] leading-[1.5] text-ink-muted"
          style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
        >
          {lede}
        </p>
      </header>

      <div className="rounded-[3px] border border-rule bg-paper-deep p-7 md:p-9">{children}</div>

      {footer ? (
        <p className="mt-8 text-center font-body text-[0.95rem] text-ink-muted">{footer}</p>
      ) : null}

      <p className="mt-10 text-center">
        <Link
          href="/"
          className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft transition-colors hover:text-accent"
        >
          ← Back to hub
        </Link>
      </p>
    </div>
  );
}
