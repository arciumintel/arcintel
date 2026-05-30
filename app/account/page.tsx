import Link from "next/link";
import { headers } from "next/headers";
import { ArrowUpRight } from "lucide-react";
import EnrollmentList from "@/components/account/EnrollmentList";
import SignOutButton from "@/components/account/SignOutButton";
import { auth } from "@/lib/auth";
import { resolveTenantContext } from "@/lib/tenant/context";
import { listLearnerEnrollments } from "@/lib/tenant/repositories/enrollments";

export const metadata = {
  title: "Account",
  description: "Your enrollments and progress across every program on the Arcademy hub.",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[860px] pb-32 pt-10 md:pt-16">
        <AccountPageHeader
          lede="One Arcademy account holds your progress across every program on the hub. Sign in to keep a lesson, restart a quiz, and resume where you left off."
        />

        <section className="border border-ink/15 bg-paper-deep p-8 md:p-10">
          <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
            Guest mode
          </p>
          <p className="mt-3 font-sans text-[1.18rem] font-semibold leading-[1.4] tracking-[-0.015em] text-ink">
            You&rsquo;re reading without an account.
          </p>
          <p className="mt-4 font-sans text-[1rem] leading-[1.6] text-ink-muted">
            Lesson 1 is open without an account. Sign in to save your reading progress, then
            enroll to unlock the rest of the program.
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
      </div>
    );
  }

  const ctx = await resolveTenantContext();
  const enrollments =
    ctx.kind === "anonymous" || ctx.kind === "system"
      ? []
      : await listLearnerEnrollments(ctx);

  const username =
    "username" in user && typeof user.username === "string" ? user.username : null;

  return (
    <div className="mx-auto w-full max-w-[860px] pb-32 pt-10 md:pt-16">
      <AccountPageHeader lede="Signed in — progress below is tied to this account across every program on the hub." />

      <section className="mb-10 border border-ink/15 bg-paper-deep p-7 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              Signed in
            </p>
            <p className="mt-2 font-sans text-[1.5rem] font-semibold leading-tight tracking-[-0.02em] text-ink">
              {user.name}
            </p>
            {username ? (
              <p className="mt-1 font-mono text-[0.68rem] text-ink-muted">@{username}</p>
            ) : null}
            <p className="mt-2 font-sans text-[0.95rem] text-ink-muted">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
        {ctx.kind === "staff" ? (
          <p className="mt-6 border-t border-ink/15 pt-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">
            Staff access enabled
          </p>
        ) : null}
      </section>

      <div className="mb-6 flex items-end justify-between gap-4 border-b border-ink/15 pb-4">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
          Programs
        </h2>
        <Link
          href="/programs"
          className="group inline-flex items-center gap-1 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
        >
          <span className="border-b border-ink-faint group-hover:border-accent">
            Browse catalog
          </span>
          <ArrowUpRight size={12} strokeWidth={1.8} />
        </Link>
      </div>

      <EnrollmentList enrollments={enrollments} />
    </div>
  );
}

function AccountPageHeader({ lede }: { lede: string }) {
  return (
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
        {lede}
      </p>
    </header>
  );
}
