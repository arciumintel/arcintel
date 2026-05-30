"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowUpRight } from "lucide-react";
import { enrollProgramAction } from "@/lib/learner/actions";

type ProgramEnrollCTAProps = {
  programSlug: string;
  firstLessonSlug: string | null;
  firstLessonTitle: string | null;
  previewMode: boolean;
  authState: "anonymous" | "signed_in";
  isEnrolled: boolean;
  continueLessonSlug: string | null;
  showEnrolledNotice?: boolean;
  compact?: boolean;
};

export default function ProgramEnrollCTA({
  programSlug,
  firstLessonSlug,
  firstLessonTitle,
  previewMode,
  authState,
  isEnrolled,
  continueLessonSlug,
  showEnrolledNotice = false,
  compact = false,
}: ProgramEnrollCTAProps) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const sectionClass = compact ? "space-y-4" : "mt-10 space-y-4";

  const lessonHref =
    firstLessonSlug !== null
      ? `/programs/${programSlug}/lessons/${firstLessonSlug}`
      : null;
  const continueHref =
    continueLessonSlug !== null
      ? `/programs/${programSlug}/lessons/${continueLessonSlug}`
      : lessonHref;

  if (previewMode) {
    if (!lessonHref) return null;
    return (
      <div className="mt-10 flex flex-wrap items-center gap-5">
        <Link
          href={lessonHref}
          className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
        >
          Begin reading
          <ArrowUpRight
            size={15}
            strokeWidth={1.8}
            className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
          />
        </Link>
        {firstLessonTitle ? (
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-soft">
            Starts with: {firstLessonTitle}
          </span>
        ) : null}
      </div>
    );
  }

  if (isEnrolled && continueHref) {
    return (
      <div className={sectionClass}>
        {showEnrolledNotice ? (
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-accent">
            Enrolled — your progress is saved to this account.
          </p>
        ) : null}
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href={continueHref}
            className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
          >
            Continue reading
            <ArrowUpRight
              size={15}
              strokeWidth={1.8}
              className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
            />
          </Link>
          {lessonHref ? (
            <Link
              href={lessonHref}
              className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
            >
              <span className="border-b border-ink-faint group-hover:border-accent">
                From the start
              </span>
              <ArrowUpRight size={12} strokeWidth={1.8} />
            </Link>
          ) : null}
        </div>
      </div>
    );
  }

  if (authState === "anonymous") {
    return (
      <div className={sectionClass}>
        <div className="flex flex-wrap items-center gap-5">
          <Link
            href={`/login?next=${encodeURIComponent(`/programs/${programSlug}`)}`}
            className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
          >
            Sign in to enroll
            <ArrowUpRight
              size={15}
              strokeWidth={1.8}
              className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
            />
          </Link>
          {lessonHref ? (
            <Link
              href={lessonHref}
              className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
            >
              <span className="border-b border-ink-faint group-hover:border-accent">
                Preview lesson 1
              </span>
              <ArrowUpRight size={12} strokeWidth={1.8} />
            </Link>
          ) : null}
        </div>
        <p className="max-w-[52ch] font-sans text-[0.95rem] leading-[1.55] text-ink-muted">
          Lesson 1 is open without an account. Sign in to save your reading progress, then enroll
          to unlock the full path.
        </p>
      </div>
    );
  }

  return (
    <div className={sectionClass}>
      <div className="flex flex-wrap items-center gap-5">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setError(null);
            startTransition(async () => {
              const result = await enrollProgramAction(programSlug);
              if (result && !result.ok) {
                setError(result.error);
              }
            });
          }}
          className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Enrolling…" : "Enroll"}
          <ArrowUpRight
            size={15}
            strokeWidth={1.8}
            className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
          />
        </button>
        {lessonHref ? (
          <Link
            href={lessonHref}
            className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
          >
            <span className="border-b border-ink-faint group-hover:border-accent">
              Preview lesson 1
            </span>
            <ArrowUpRight size={12} strokeWidth={1.8} />
          </Link>
        ) : null}
      </div>
      {error ? (
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-accent">
          {error}
        </p>
      ) : (
        <p className="max-w-[52ch] font-sans text-[0.95rem] leading-[1.55] text-ink-muted">
          Enroll to unlock every lesson and track progress on your Arcademy account.
        </p>
      )}
    </div>
  );
}
