import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";
import { loadHubProgram, loadHubPrograms } from "@/lib/hub/programs";

interface Props {
  params: Promise<{ programSlug: string }>;
}

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  if (process.env.DATABASE_URL) {
    return [];
  }

  const programs = await loadHubPrograms();
  return programs.map((p) => ({ programSlug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { programSlug } = await params;
  const program = await loadHubProgram(programSlug);
  if (!program) return { title: "Not found" };
  return { title: program.title, description: program.tagline };
}

export default async function ProgramPage({ params }: Props) {
  const { programSlug } = await params;
  const program = await loadHubProgram(programSlug);
  if (!program) notFound();

  const firstLesson = program.tracks[0]?.lessons[0];

  return (
    <div className="mx-auto w-full max-w-[1440px] pb-32 pt-10 md:pt-16">
      <p className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft">
        <Link href="/programs" className="hover:text-accent">
          Programs
        </Link>
        <span aria-hidden className="mx-2 text-ink-faint">
          /
        </span>
        {program.org}
      </p>

      <header className="mb-14 grid items-end gap-10 border-b border-ink/15 pb-12 md:grid-cols-[1fr_300px]">
        <div>
          <h1
            className="font-sans text-ink"
            style={{
              fontSize: "clamp(2.6rem, 7.5vw, 6rem)",
              fontWeight: 800,
              lineHeight: 0.9,
              letterSpacing: "-0.045em",
            }}
          >
            {program.title}
            <span className="text-accent">.</span>
          </h1>
          <p className="mt-7 max-w-[640px] font-sans text-[1.08rem] leading-[1.55] text-ink-muted md:text-[1.18rem]">
            {program.tagline}
          </p>

          {firstLesson ? (
            <div className="mt-10 flex flex-wrap items-center gap-5">
              <Link
                href={`/programs/${program.slug}/lessons/${firstLesson.slug}`}
                className="group inline-flex items-center gap-2 bg-ink px-6 py-3.5 font-sans text-[0.9rem] font-semibold text-paper-deep transition-colors hover:bg-accent"
              >
                Begin reading
                <ArrowUpRight
                  size={15}
                  strokeWidth={1.8}
                  className="transition-transform group-hover:translate-x-[2px] group-hover:-translate-y-[2px]"
                />
              </Link>
              <span className="font-mono text-[0.66rem] uppercase tracking-[0.14em] text-ink-soft">
                Starts with: {firstLesson.title}
              </span>
            </div>
          ) : null}
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 border-t border-ink/15 pt-5 md:grid-cols-1">
          {[
            ["Organisation", program.org],
            ["Tracks", `${program.trackCount}`],
            ["Lessons", `${program.lessonCount}`],
            ["Reading time", `~${program.estimatedHours} hrs`],
          ].map(([label, value]) => (
            <div
              key={label}
              className="flex flex-col md:flex-row md:items-baseline md:justify-between md:border-b md:border-ink/10 md:pb-3"
            >
              <dt className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-soft">
                {label}
              </dt>
              <dd className="font-sans text-[0.92rem] font-semibold text-ink num-tabular">
                {value}
              </dd>
            </div>
          ))}
        </dl>
      </header>

      <section>
        <div className="mb-10 flex items-baseline justify-between border-b border-ink/15 pb-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent">
              01 / Reading path
            </span>
            <span className="h-px w-12 bg-ink/15" />
          </div>
          <div className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-soft num-tabular">
            {program.trackCount} {program.trackCount === 1 ? "track" : "tracks"}
          </div>
        </div>

        <div className="space-y-16">
          {program.tracks.map((track, ti) => (
            <article key={track.slug}>
              <header className="mb-5 flex items-center gap-4">
                <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-accent num-tabular">
                  Track {String(ti + 1).padStart(2, "0")}
                </span>
                <span className="h-px flex-1 bg-ink/15" />
                <span className="font-mono text-[0.6rem] uppercase tracking-[0.14em] text-ink-soft num-tabular">
                  {track.lessons.length} {track.lessons.length === 1 ? "lesson" : "lessons"}
                </span>
              </header>

              <div className="mb-7">
                <h2 className="font-sans text-[1.7rem] font-bold tracking-[-0.025em] text-ink md:text-[2rem]">
                  {track.title}
                </h2>
                {track.description ? (
                  <p className="mt-1 font-sans text-[1rem] leading-[1.5] text-ink-muted">
                    {track.description}
                  </p>
                ) : null}
              </div>

              <ol className="border-t border-ink/15">
                {track.lessons.map((lesson, li) => (
                  <li key={lesson.slug}>
                    <Link
                      href={`/programs/${program.slug}/lessons/${lesson.slug}`}
                      className="group grid grid-cols-1 items-baseline gap-x-6 gap-y-2 border-b border-ink/10 py-5 transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-paper-deep md:grid-cols-[60px_1fr_auto] md:gap-y-0"
                    >
                      <span className="font-mono text-[0.7rem] tabular-nums text-ink-soft">
                        {String(li + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h4 className="font-sans text-[1.18rem] font-semibold tracking-[-0.015em] text-ink transition-colors group-hover:text-accent">
                          {lesson.title}
                        </h4>
                        <p className="mt-1 max-w-[58ch] text-[0.95rem] leading-[1.5] text-ink-muted">
                          {lesson.blurb}
                        </p>
                      </div>
                      <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft num-tabular">
                        <span>{lesson.readingMinutes} min</span>
                        {lesson.hasQuiz ? <span className="ml-3 text-accent">+ quiz</span> : null}
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
