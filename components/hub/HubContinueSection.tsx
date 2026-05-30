import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LearnerEnrollmentRow } from "@/lib/tenant/repositories/enrollments";

type HubContinueSectionProps = {
  enrollments: LearnerEnrollmentRow[];
};

export default function HubContinueSection({ enrollments }: HubContinueSectionProps) {
  const active = enrollments.find(
    (row) =>
      row.continueLessonSlug &&
      row.totalLessons > 0 &&
      row.completedLessons < row.totalLessons,
  );

  if (!active?.continueLessonSlug) {
    return null;
  }

  const href = `/programs/${active.programSlug}/lessons/${active.continueLessonSlug}`;

  return (
    <section className="mb-24 border border-ink/15 bg-paper-deep p-8 md:p-10">
      <div className="mb-5 flex items-center gap-3">
        <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
          Continue
        </span>
        <span className="h-px flex-1 bg-ink/15" />
      </div>
      <h2 className="font-sans text-[1.7rem] font-bold tracking-[-0.025em] text-ink md:text-[2rem]">
        Pick up where you left off<span className="text-accent">.</span>
      </h2>
      <p className="mt-4 max-w-[52ch] font-sans text-[1rem] leading-[1.55] text-ink-muted">
        {active.programTitle} — {active.completedLessons} of {active.totalLessons} lessons
        complete.
      </p>
      <div className="mt-7 flex flex-wrap items-center gap-4">
        <Link
          href={href}
          className="group inline-flex items-center gap-2 bg-ink px-6 py-3 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
        >
          Continue reading
          <ArrowUpRight
            size={15}
            strokeWidth={1.8}
            className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
          />
        </Link>
        <Link
          href="/account"
          className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
        >
          <span className="border-b border-ink-faint group-hover:border-accent">
            All enrollments
          </span>
          <ArrowUpRight size={12} strokeWidth={1.8} />
        </Link>
      </div>
    </section>
  );
}
