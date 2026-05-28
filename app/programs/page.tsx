import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { listPrograms } from "@/lib/preview-data";

export const metadata = {
  title: "Programs",
  description: "The full Arcademy program catalog — every learning path on the hub.",
};

export default async function ProgramsPage() {
  const programs = listPrograms();

  return (
    <div className="mx-auto w-full max-w-[1440px] pb-32 pt-10 md:pt-16">
      <header className="mb-14 border-b border-ink/15 pb-10">
        <div className="mb-7 flex items-center gap-3">
          <span aria-hidden className="block h-2 w-2 rounded-full bg-accent" />
          <span className="font-mono text-[0.66rem] uppercase tracking-[0.18em] text-ink-soft">
            Catalog · {programs.length} {programs.length === 1 ? "program" : "programs"} listed
          </span>
        </div>
        <h1
          className="font-sans text-ink"
          style={{
            fontSize: "clamp(2.8rem, 8vw, 6.4rem)",
            fontWeight: 800,
            lineHeight: 0.9,
            letterSpacing: "-0.045em",
          }}
        >
          Every program<br />
          on the hub<span className="text-accent">.</span>
        </h1>
        <p className="mt-7 max-w-[640px] font-sans text-[1.05rem] leading-[1.55] text-ink-muted">
          Each program is a structured reading path produced by, or in partnership with, an
          ecosystem team. Staff publishes the snapshot you read; nothing changes mid-program.
        </p>
      </header>

      <ol className="border-t border-ink/30 stagger">
        {programs.map((program, idx) => (
          <li key={program.slug}>
            <Link
              href={`/programs/${program.slug}`}
              className="group grid grid-cols-1 items-baseline gap-x-8 gap-y-3 border-b border-ink/15 py-9 transition-all duration-[320ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-paper-deep md:grid-cols-[140px_1fr_180px] md:gap-y-0 md:py-11"
            >
              <span
                className="font-sans text-ink/25 transition-colors group-hover:text-accent num-tabular"
                style={{
                  fontSize: "clamp(3rem, 6vw, 5.2rem)",
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.9,
                }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>

              <div>
                <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h2 className="font-sans text-[1.7rem] font-bold tracking-[-0.025em] text-ink transition-colors group-hover:text-accent md:text-[2rem]">
                    {program.title}
                  </h2>
                  <span className="font-mono text-[0.58rem] uppercase tracking-[0.18em] text-ink-soft">
                    by {program.org}
                  </span>
                  {program.hubStatus === "featured" ? (
                    <span className="border border-accent px-1.5 py-0.5 font-mono text-[0.54rem] uppercase tracking-[0.18em] text-accent">
                      Featured
                    </span>
                  ) : null}
                </div>
                <p className="max-w-[60ch] text-[1rem] leading-[1.55] text-ink-muted">
                  {program.tagline}
                </p>
              </div>

              <div className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft num-tabular md:justify-self-end">
                <div className="md:text-right">{program.trackCount} tracks</div>
                <div className="mt-1 md:text-right">{program.lessonCount} lessons</div>
                <div className="mt-1 md:text-right">~{program.estimatedHours} hrs</div>
                <div className="mt-3 inline-flex items-center gap-1 text-accent md:flex md:justify-end">
                  Open <ArrowUpRight size={11} strokeWidth={1.8} />
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
