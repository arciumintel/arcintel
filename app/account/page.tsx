import Link from "next/link";
import { headers } from "next/headers";
import EnrollmentList from "@/components/account/EnrollmentList";
import SignOutButton from "@/components/account/SignOutButton";
import { auth } from "@/lib/auth";
import { resolveTenantContext } from "@/lib/tenant/context";
import { listLearnerEnrollments } from "@/lib/tenant/repositories/enrollments";

export const metadata = {
  title: "Account",
  description: "Your enrollments and progress across every program on the Arcidex hub.",
};

export default async function AccountPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const user = session?.user;

  if (!user) {
    return (
      <div className="mx-auto w-full max-w-[860px] pb-32 pt-6 md:pt-10">
        <AccountHeader
          title="Your enrollments."
          lede="One Arcidex account holds your progress across every program on the hub. Sign in to keep a lesson, restart a quiz, and resume where you left off."
        />

        <section className="rounded-[3px] border border-rule bg-paper-deep p-8 md:p-10">
          <p
            className="font-display italic text-[1.05rem] text-ink-muted"
            style={{ fontVariationSettings: "'opsz' 144" }}
          >
            You&rsquo;re reading as a guest.
          </p>
          <p className="mt-4 font-body text-[1.02rem] leading-[1.62] text-ink">
            Phase 1 of Arcidex includes a guest-friendly path: open Lesson 01 of any featured program,
            read it through, and choose to save progress on completion. Until you sign up, nothing is
            tracked beyond the current tab.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Link
              href="/login"
              className="ui-btn-filled rounded-[2px] bg-ink px-5 py-2.5 font-ui text-[0.84rem] font-medium text-paper-deep hover:bg-accent"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="font-display italic text-[0.96rem] text-ink-muted underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
              style={{ fontVariationSettings: "'opsz' 144" }}
            >
              or, create an account
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
    <div className="mx-auto w-full max-w-[860px] pb-32 pt-6 md:pt-10">
      <AccountHeader
        title="Your enrollments."
        lede="Signed in as yourself — progress below is tied to this account across every program on the hub."
      />

      <section className="mb-10 rounded-[3px] border border-rule bg-paper-deep p-7 md:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              Signed in
            </p>
            <p className="mt-2 font-masthead text-[1.6rem] leading-tight text-ink">{user.name}</p>
            {username ? (
              <p className="mt-1 font-mono text-[0.68rem] text-ink-muted">@{username}</p>
            ) : null}
            <p className="mt-2 font-body text-[0.95rem] text-ink-muted">{user.email}</p>
          </div>
          <SignOutButton />
        </div>
        {ctx.kind === "staff" ? (
          <p className="mt-6 border-t border-rule pt-5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-accent">
            Staff access enabled
          </p>
        ) : null}
      </section>

      <div className="mb-6 flex items-end justify-between gap-4 border-b border-rule pb-4">
        <h2 className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-ink-soft">
          Programs
        </h2>
        <Link
          href="/programs"
          className="font-display italic text-[0.9rem] text-ink-muted underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          Browse catalog
        </Link>
      </div>

      <EnrollmentList enrollments={enrollments} />
    </div>
  );
}

function AccountHeader({ title, lede }: { title: string; lede: string }) {
  return (
    <header className="mb-12 border-b border-ink pb-10">
      <p className="mb-4 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-ink-soft">
        Account
      </p>
      <h1
        className="font-masthead text-[2.4rem] leading-[0.98] text-ink md:text-[3.2rem]"
        style={{
          fontWeight: 300,
          letterSpacing: "-0.035em",
          fontVariationSettings: "'opsz' 144, 'SOFT' 30",
        }}
      >
        {title}
      </h1>
      <p
        className="mt-6 max-w-[620px] font-display italic text-[1.12rem] leading-[1.5] text-ink-muted"
        style={{ fontWeight: 300, fontVariationSettings: "'opsz' 144, 'SOFT' 60" }}
      >
        {lede}
      </p>
    </header>
  );
}
