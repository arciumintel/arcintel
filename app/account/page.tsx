import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const metadata = {
  title: "Account",
  description: "Your enrollments and progress across every program on the Arcademy hub.",
};

export default function AccountPage() {
  return (
    <div className="mx-auto w-full max-w-[860px] pb-32 pt-10 md:pt-16">
      <header className="mb-14 border-b border-ink/15 pb-10">
        <div className="mb-5 flex items-center gap-3">
          <span aria-hidden className="block h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft">
            Account
          </span>
        </div>
        <h1
          className="font-sans text-ink"
          style={{
            fontSize: "clamp(2.6rem, 7vw, 5.4rem)",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.045em",
          }}
        >
          Your enrollments<span className="text-accent">.</span>
        </h1>
        <p className="mt-7 max-w-[620px] font-sans text-[1.05rem] leading-[1.55] text-ink-muted">
          One Arcademy account holds your progress across every program on the hub. Sign in to keep
          a lesson, restart a quiz, and resume where you left off.
        </p>
      </header>

      <section className="border border-ink/15 bg-paper-deep p-8 md:p-10">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
          Guest mode
        </p>
        <p className="mt-3 font-sans text-[1.18rem] leading-[1.4] font-semibold tracking-[-0.015em] text-ink">
          You&rsquo;re reading without an account.
        </p>
        <p className="mt-4 font-sans text-[1rem] leading-[1.6] text-ink-muted">
          Phase 1 of Arcademy includes a guest-friendly path: open Lesson 01 of any featured
          program, read it through, and choose to save progress on completion. Until you sign up,
          nothing is tracked beyond the current tab.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-4">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-sans text-[0.86rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
          >
            Sign in
            <ArrowUpRight
              size={14}
              strokeWidth={1.8}
              className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
            />
          </Link>
          <Link
            href="/register"
            className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
          >
            <span className="border-b border-ink-faint group-hover:border-accent">
              Create an account
            </span>
            <ArrowUpRight size={12} strokeWidth={1.8} />
          </Link>
        </div>
      </section>

      <p className="mt-8 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
        Auth wiring · <span className="text-ink-muted">better-auth / api/auth/[…all]</span>
      </p>
    </div>
  );
}
