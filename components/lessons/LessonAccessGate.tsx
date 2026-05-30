import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { LessonAccessDenied } from "@/lib/hub/lesson-access";
import ProgramEnrollCTA from "@/components/programs/ProgramEnrollCTA";

type LessonAccessGateProps = {
  programSlug: string;
  programTitle: string;
  lessonTitle: string;
  gate: LessonAccessDenied;
  authState: "anonymous" | "signed_in";
  previewMode: boolean;
};

export default function LessonAccessGate({
  programSlug,
  programTitle,
  lessonTitle,
  gate,
  authState,
  previewMode,
}: LessonAccessGateProps) {
  const isSignIn = gate.reason === "sign_in";

  return (
    <div className="mx-auto w-full max-w-3xl pb-32 pt-10 md:pt-14">
      <nav
        aria-label="Breadcrumb"
        className="mb-12 flex flex-wrap items-baseline gap-x-2 gap-y-1 font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft"
      >
        <Link href="/programs" className="hover:text-ink">
          Programs
        </Link>
        <span aria-hidden className="text-ink-faint">
          /
        </span>
        <Link href={`/programs/${programSlug}`} className="hover:text-ink">
          {programTitle}
        </Link>
      </nav>

      <section className="border border-ink/15 bg-paper-deep p-8 md:p-10">
        <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
          {isSignIn ? "Sign in required" : "Enrollment required"}
        </p>
        <h1
          className="mt-4 font-sans text-ink"
          style={{
            fontSize: "clamp(2rem, 5vw, 3.2rem)",
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: "-0.035em",
          }}
        >
          {lessonTitle}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-6 max-w-[42rem] font-sans text-[1.05rem] leading-[1.55] text-ink-muted">
          {isSignIn
            ? "Lesson 1 is open to everyone. Sign in and enroll to continue through the rest of this program."
            : "Enroll in this program to unlock the full reading path and save progress to your Arcademy account."}
        </p>

        <div className="mt-8">
          {isSignIn ? (
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={`/login?next=${encodeURIComponent(`/programs/${programSlug}`)}`}
                className="group inline-flex items-center gap-2 bg-ink px-5 py-2.5 font-sans text-[0.86rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
              >
                Sign in to enroll
                <ArrowUpRight size={14} strokeWidth={1.8} />
              </Link>
              <Link
                href={`/programs/${programSlug}/lessons/${gate.firstLessonSlug}`}
                className="group inline-flex items-center gap-1.5 font-mono text-[0.7rem] uppercase tracking-[0.14em] text-ink-muted transition-colors hover:text-accent"
              >
                <span className="border-b border-ink-faint group-hover:border-accent">
                  Back to lesson 1
                </span>
                <ArrowUpRight size={12} strokeWidth={1.8} />
              </Link>
            </div>
          ) : (
            <ProgramEnrollCTA
              programSlug={programSlug}
              firstLessonSlug={gate.firstLessonSlug}
              firstLessonTitle={null}
              previewMode={previewMode}
              authState={authState}
              isEnrolled={false}
              continueLessonSlug={null}
              compact
            />
          )}
        </div>
      </section>
    </div>
  );
}
