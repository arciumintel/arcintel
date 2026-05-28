import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import LessonBlockRenderer from "@/components/lessons/LessonBlockRenderer";
import { findLesson, getProgramBySlug, listPrograms } from "@/lib/preview-data";

interface Props {
  params: Promise<{ programSlug: string; lessonSlug: string }>;
}

export async function generateStaticParams() {
  const out: { programSlug: string; lessonSlug: string }[] = [];
  for (const program of listPrograms()) {
    for (const track of program.tracks) {
      for (const lesson of track.lessons) {
        out.push({ programSlug: program.slug, lessonSlug: lesson.slug });
      }
    }
  }
  return out;
}

export async function generateMetadata({ params }: Props) {
  const { programSlug, lessonSlug } = await params;
  const lesson = findLesson(programSlug, lessonSlug);
  if (!lesson) return { title: "Not found" };
  return { title: lesson.title, description: lesson.blurb };
}

export default async function LessonPage({ params }: Props) {
  const { programSlug, lessonSlug } = await params;
  const lesson = findLesson(programSlug, lessonSlug);
  const program = getProgramBySlug(programSlug);
  if (!lesson || !program) notFound();

  const flat = program.tracks.flatMap((t) =>
    t.lessons.map((l) => ({ slug: l.slug, title: l.title, trackTitle: t.title })),
  );
  const idx = flat.findIndex((l) => l.slug === lesson.slug);
  const prev = idx > 0 ? flat[idx - 1] : null;
  const next = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;
  const lessonNumberLabel = String(idx + 1).padStart(2, "0");

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
        <Link href={`/programs/${program.slug}`} className="hover:text-ink">
          {program.title}
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

      {lesson.quiz ? (
        <section className="mt-20 border-t border-ink/30 pt-12">
          <header className="mb-7">
            <p className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
              Comprehension check
            </p>
            <h2 className="mt-2 font-sans text-[1.7rem] font-bold tracking-[-0.025em] text-ink md:text-[2rem]">
              Check yourself<span className="text-accent">.</span>
            </h2>
          </header>
          <div className="border border-ink/15 bg-paper-deep p-6 md:p-8">
            <ol className="space-y-8">
              {lesson.quiz.questions.map((q, qi) => (
                <li key={q.id}>
                  <div className="mb-3 flex items-baseline gap-2 font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                    <span className="text-accent num-tabular">Q{String(qi + 1).padStart(2, "0")}</span>
                    <span>{q.type === "single" ? "Single choice" : "Short answer"}</span>
                  </div>
                  <p className="mb-4 font-sans text-[1.05rem] leading-[1.5] text-ink">{q.prompt}</p>
                  {q.type === "single" ? (
                    <ul className="space-y-2">
                      {q.choices.map((choice, ci) => (
                        <li key={ci}>
                          <label className="group flex cursor-pointer items-baseline gap-3">
                            <input
                              type="radio"
                              name={q.id}
                              className="mt-1 h-3 w-3 accent-[var(--accent-c,#C5462E)]"
                            />
                            <span className="font-sans text-[0.98rem] leading-[1.5] text-ink-muted group-hover:text-ink">
                              {choice}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <textarea
                      className="min-h-[80px] w-full border border-ink/15 bg-background p-3 font-sans text-[0.98rem] leading-[1.55] text-ink placeholder:text-ink-soft/60 focus:border-accent focus:outline-none"
                      placeholder="One or two sentences."
                    />
                  )}
                </li>
              ))}
            </ol>
            <div className="mt-8 flex items-center gap-4">
              <button
                type="button"
                className="bg-ink px-5 py-2.5 font-sans text-[0.86rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
              >
                Submit answers
              </button>
              <span className="font-mono text-[0.6rem] uppercase tracking-[0.18em] text-ink-soft">
                Not submitted
              </span>
            </div>
          </div>
        </section>
      ) : null}

      <nav
        aria-label="Lesson navigation"
        className="mt-16 flex flex-col gap-8 border-t border-ink/15 pt-10 sm:flex-row sm:justify-between"
      >
        {prev ? (
          <Link
            href={`/programs/${program.slug}/lessons/${prev.slug}`}
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
            href={`/programs/${program.slug}/lessons/${next.slug}`}
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
