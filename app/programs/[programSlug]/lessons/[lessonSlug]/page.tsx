import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LessonBlockRenderer from "@/components/lessons/LessonBlockRenderer";
import HubQuizSection from "@/components/lessons/HubQuizSection";
import { loadHubLesson, loadHubStaticParams } from "@/lib/hub/programs";

interface Props {
  params: Promise<{ programSlug: string; lessonSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  if (process.env.DATABASE_URL) {
    return [];
  }

  const params = await loadHubStaticParams();
  return params
    .filter(
      (entry): entry is { programSlug: string; lessonSlug: string } =>
        entry.lessonSlug !== undefined,
    )
    .map(({ programSlug, lessonSlug }) => ({ programSlug, lessonSlug }));
}

export async function generateMetadata({ params }: Props) {
  const { programSlug, lessonSlug } = await params;
  const lesson = await loadHubLesson({ programSlug, lessonSlug });
  if (!lesson) return { title: "Not found" };
  return { title: lesson.title, description: lesson.blurb };
}

export default async function LessonPage({ params }: Props) {
  const { programSlug, lessonSlug } = await params;
  const lesson = await loadHubLesson({ programSlug, lessonSlug });
  if (!lesson) notFound();

  const { flat, index } = lesson.navigation;
  const prev = index > 0 ? flat[index - 1] : null;
  const next = index >= 0 && index < flat.length - 1 ? flat[index + 1] : null;
  const lessonNumberLabel = String(index + 1).padStart(2, "0");

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
        <Link href={`/programs/${lesson.programSlug}`} className="hover:text-ink">
          {lesson.programTitle}
        </Link>
        <span aria-hidden className="text-ink-faint">
          /
        </span>
        <span>Lesson {lessonNumberLabel}</span>
      </nav>

      <header className="border-b border-ink/15 pb-10">
        <div className="mb-5 flex items-center gap-3">
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
            {lesson.trackTitle}
          </span>
          <span aria-hidden className="h-px w-12 bg-ink/15" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft num-tabular">
            Lesson {lessonNumberLabel} / {String(flat.length).padStart(2, "0")}
          </span>
        </div>
        <h1
          className="font-sans text-ink"
          style={{
            fontSize: "clamp(2.4rem, 6vw, 4.8rem)",
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
          }}
        >
          {lesson.title}
          <span className="text-accent">.</span>
        </h1>
        <p className="mt-7 max-w-[42rem] font-sans text-[1.12rem] leading-[1.5] text-ink-muted">
          {lesson.blurb}
        </p>
        <p className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[0.62rem] uppercase tracking-[0.16em] tabular-nums text-ink-soft">
          <span>By the editors</span>
          <span aria-hidden className="text-ink-faint">
            /
          </span>
          <span>{lesson.readingMinutes} min read</span>
          {lesson.quiz ? (
            <>
              <span aria-hidden className="text-ink-faint">
                /
              </span>
              <span className="text-accent">+ comprehension check</span>
            </>
          ) : null}
        </p>
      </header>

      <article className="mt-12 md:mt-16">
        <LessonBlockRenderer blocks={lesson.blocks} />
      </article>

      {lesson.quiz ? <HubQuizSection quiz={lesson.quiz} /> : null}

      <nav
        aria-label="Lesson navigation"
        className="mt-16 flex flex-col gap-8 border-t border-ink/15 pt-10 sm:flex-row sm:justify-between"
      >
        {prev ? (
          <Link
            href={`/programs/${lesson.programSlug}/lessons/${prev.slug}`}
            className="ui-tap group max-w-sm"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              <ArrowLeft size={12} strokeWidth={1.8} /> Previous
            </span>
            <span className="mt-2 block font-sans text-[1.12rem] font-semibold leading-[1.2] tracking-[-0.015em] text-ink group-hover:text-accent">
              {prev.title}
            </span>
          </Link>
        ) : (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
            First lesson
          </span>
        )}
        {next ? (
          <Link
            href={`/programs/${lesson.programSlug}/lessons/${next.slug}`}
            className="ui-tap group max-w-sm sm:text-right"
          >
            <span className="inline-flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
              Next <ArrowRight size={12} strokeWidth={1.8} />
            </span>
            <span className="mt-2 block font-sans text-[1.12rem] font-semibold leading-[1.2] tracking-[-0.015em] text-ink group-hover:text-accent">
              {next.title}
            </span>
          </Link>
        ) : (
          <span className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft sm:text-right">
            End of program
          </span>
        )}
      </nav>
    </div>
  );
}
