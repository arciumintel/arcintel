import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { LearnerEnrollmentRow } from "@/lib/tenant/repositories/enrollments";

function formatEnrolledAt(iso: string) {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}

function progressLabel(row: LearnerEnrollmentRow) {
  if (row.totalLessons === 0) {
    return "No lessons published yet";
  }
  if (row.completedLessons >= row.totalLessons) {
    return `Complete · ${row.completedLessons} of ${row.totalLessons} lessons`;
  }
  return `${row.completedLessons} of ${row.totalLessons} lessons complete`;
}

type EnrollmentListProps = {
  enrollments: LearnerEnrollmentRow[];
};

export default function EnrollmentList({ enrollments }: EnrollmentListProps) {
  if (enrollments.length === 0) {
    return (
      <section className="rounded-[3px] border border-rule bg-paper-deep p-8 md:p-10">
        <p
          className="font-display italic text-[1.05rem] text-ink-muted"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          No enrollments yet.
        </p>
        <p className="mt-4 font-body text-[1.02rem] leading-[1.62] text-ink">
          Open a program from the hub and start its first lesson. When you enroll, your progress
          will show up here.
        </p>
        <div className="mt-7">
          <Link
            href="/programs"
            className="ui-btn-filled inline-flex items-center gap-2 rounded-[2px] bg-ink px-5 py-2.5 font-ui text-[0.84rem] font-medium text-paper-deep hover:bg-accent"
          >
            Browse programs
            <ArrowRight size={15} strokeWidth={1.5} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <ul className="divide-y divide-rule rounded-[3px] border border-rule bg-paper-deep">
      {enrollments.map((row) => {
        const href = row.continueLessonSlug
          ? `/programs/${row.programSlug}/lessons/${row.continueLessonSlug}`
          : `/programs/${row.programSlug}`;
        const cta =
          row.continueLessonSlug && row.completedLessons < row.totalLessons
            ? "Continue"
            : row.totalLessons > 0 && row.completedLessons >= row.totalLessons
              ? "Review program"
              : "Open program";

        return (
          <li key={row.programSlug} className="p-7 md:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                  Enrolled {formatEnrolledAt(row.enrolledAt)}
                </p>
                <h2 className="mt-2 font-masthead text-[1.45rem] leading-tight text-ink">
                  {row.programTitle}
                </h2>
                {row.tagline ? (
                  <p className="mt-2 font-body text-[0.98rem] leading-[1.55] text-ink-muted">
                    {row.tagline}
                  </p>
                ) : null}
                <p className="mt-3 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-muted">
                  {progressLabel(row)}
                </p>
              </div>
              <Link
                href={href}
                className="ui-btn-filled inline-flex shrink-0 items-center gap-2 self-start rounded-[2px] bg-ink px-5 py-2.5 font-ui text-[0.84rem] font-medium text-paper-deep hover:bg-accent"
              >
                {cta}
                <ArrowRight size={15} strokeWidth={1.5} />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
