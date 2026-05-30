import Link from "next/link";
import { ArrowUpRight, BookOpen, ShieldCheck, Users } from "lucide-react";
import HubContinueSection from "@/components/hub/HubContinueSection";
import { loadHubPrograms } from "@/lib/hub/programs";
import { listLearnerEnrollments } from "@/lib/tenant/repositories/enrollments";
import { resolveTenantContext } from "@/lib/tenant/context";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const programs = await loadHubPrograms();
  const ctx = await resolveTenantContext();
  const enrollments =
    ctx.kind === "anonymous" || ctx.kind === "system"
      ? []
      : await listLearnerEnrollments(ctx);
  const featured = programs.find((p) => p.hubStatus === "featured") ?? programs[0];
  const totalLessons = programs.reduce((s, p) => s + p.lessonCount, 0);

  return (
    <div className="relative mx-auto w-full max-w-[1440px] pb-32 pt-10 md:pt-16">
      <section className="mb-32">
        <div className="mb-10 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span aria-hidden className="block h-2 w-2 rounded-full bg-accent" />
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft">
              Arcademy hub / v1
            </span>
          </div>
          <span className="hidden font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft num-tabular md:inline">
            01 / ARC.2026
          </span>
        </div>

        <h1
          className="font-sans text-ink"
          style={{
            fontSize: "clamp(2.4rem, 7vw, 5.6rem)",
            fontWeight: 800,
            lineHeight: 0.94,
            letterSpacing: "-0.04em",
            marginLeft: "-0.02em",
          }}
        >
          <span className="block">One hub.</span>
          <span className="block">Every ecosystem program<span className="text-accent">.</span></span>
        </h1>

        <div className="mt-12 grid grid-cols-1 items-end gap-y-10 md:mt-16 md:grid-cols-[1fr_300px] md:gap-x-14">
          <div>
            <p className="max-w-[620px] font-sans text-[1.06rem] leading-[1.55] text-ink-muted md:text-[1.2rem]">
              Curated programs from partner teams in the Arcium ecosystem. Read the lessons.
              Pass the comprehension checks. Keep your progress across every program with one
              account.
            </p>
            {featured ? (
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Link
                  href={`/programs/${featured.slug}`}
                  className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.92rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
                >
                  Open {featured.title}
                  <ArrowUpRight
                    size={15}
                    strokeWidth={1.8}
                    className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                  />
                </Link>
                <Link
                  href="/programs"
                  className="group inline-flex items-center gap-1.5 font-mono text-[0.74rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
                >
                  <span className="border-b border-ink-faint group-hover:border-accent">
                    Browse all programs
                  </span>
                  <ArrowUpRight size={12} strokeWidth={1.8} />
                </Link>
              </div>
            ) : null}
          </div>

          <dl className="grid grid-cols-3 gap-x-4 gap-y-1 border-t border-ink/15 pt-5 md:grid-cols-1 md:gap-y-3">
            {[
              ["Programs", `${programs.length}`],
              ["Lessons", `${totalLessons}`],
              ["Partners", `${new Set(programs.map((p) => p.org)).size}`],
            ].map(([k, v]) => (
              <div
                key={k}
                className="flex flex-col md:flex-row md:items-baseline md:justify-between md:border-b md:border-ink/10 md:pb-3"
              >
                <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-soft">
                  {k}
                </dt>
                <dd className="font-sans text-[0.94rem] font-semibold text-ink num-tabular">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <HubContinueSection enrollments={enrollments} />

      <section className="mb-32 grid grid-cols-1 gap-px border-y border-ink/15 bg-ink/15 md:grid-cols-3">
        {[
          {
            num: "01",
            Icon: BookOpen,
            title: "Reading-first",
            line: "Editorial prose, set in Geist. Diagrams and code only where they earn their place.",
          },
          {
            num: "02",
            Icon: ShieldCheck,
            title: "Verified comprehension",
            line: "Quizzes with platform-defined question types — partners configure thresholds, not the schema.",
          },
          {
            num: "03",
            Icon: Users,
            title: "One account",
            line: "Enrollments span every partner program; staff oversees what reaches the hub.",
          },
        ].map((pillar) => (
          <div key={pillar.num} className="bg-background p-8 md:p-10">
            <div className="mb-7 flex items-baseline justify-between">
              <pillar.Icon size={20} strokeWidth={1.6} className="text-accent" />
              <span className="font-mono text-[0.6rem] tabular-nums text-ink-soft">
                {pillar.num} / 03
              </span>
            </div>
            <h3 className="mb-3 font-sans text-[1.45rem] font-semibold tracking-[-0.02em] text-ink md:text-[1.6rem]">
              {pillar.title}
            </h3>
            <p className="text-[0.98rem] leading-[1.55] text-ink-muted">{pillar.line}</p>
          </div>
        ))}
      </section>

      <section className="mb-24">
        <div className="mb-10 flex items-baseline justify-between border-b border-ink/15 pb-5">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
              02 / Catalog
            </span>
            <span className="h-px w-12 bg-ink/15" />
          </div>
          <Link
            href="/programs"
            className="group inline-flex items-center gap-1.5 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
          >
            View all
            <ArrowUpRight size={12} strokeWidth={1.8} />
          </Link>
        </div>

        <h2
          className="mb-12 font-sans text-ink"
          style={{
            fontSize: "clamp(2.4rem, 6.5vw, 5.4rem)",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
          }}
        >
          On the hub<span className="text-accent">.</span>
        </h2>

        <ol className="border-t border-ink/30 stagger">
          {programs.map((program, idx) => (
            <li key={program.slug}>
              <Link
                href={`/programs/${program.slug}`}
                className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-3 border-b border-ink/15 py-7 transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-paper-deep md:grid-cols-[120px_1fr_140px_auto] md:gap-y-0 md:py-9"
              >
                <span
                  className="font-sans text-ink/30 transition-colors group-hover:text-accent num-tabular"
                  style={{
                    fontSize: "clamp(2.8rem, 5vw, 4.4rem)",
                    fontWeight: 700,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.92,
                  }}
                >
                  {String(idx + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="mb-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-sans text-[1.5rem] font-semibold tracking-[-0.02em] text-ink transition-colors group-hover:text-accent md:text-[1.7rem]">
                      {program.title}
                    </h3>
                    {program.hubStatus === "featured" ? (
                      <span className="border border-accent px-1.5 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-accent">
                        Featured
                      </span>
                    ) : null}
                  </div>
                  <p className="max-w-[58ch] text-[0.98rem] leading-[1.55] text-ink-muted">
                    {program.tagline}
                  </p>
                </div>
                <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft num-tabular">
                  <div>{program.trackCount} tracks</div>
                  <div className="mt-1">{program.lessonCount} lessons</div>
                  <div className="mt-1">~{program.estimatedHours} hrs</div>
                </div>
                <div className="font-mono text-[0.62rem] uppercase tracking-[0.18em] text-accent">
                  Open →
                </div>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <footer className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/15 pt-8 font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-muted">
        <Link href="/programs" className="hover:text-accent">
          Programs
        </Link>
        <Link href="/account" className="hover:text-accent">
          Account
        </Link>
      </footer>
    </div>
  );
}
