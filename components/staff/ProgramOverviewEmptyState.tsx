import Link from "next/link";

type ProgramOverviewEmptyStateProps = {
  curriculumHref: string;
  settingsHref: string;
  previewHref: string;
  previewEnabled: boolean;
};

export default function ProgramOverviewEmptyState({
  curriculumHref,
  settingsHref,
  previewHref,
  previewEnabled,
}: ProgramOverviewEmptyStateProps) {
  return (
    <div className="mt-12 flex flex-col items-center">
      <div className="w-full max-w-[560px] rounded-sm border border-rule bg-paper-deep px-8 py-10 text-center">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          Curriculum · 0 lessons
        </p>
        <h2 className="mt-4 font-sans text-h3 text-ink">No lessons yet</h2>
        <p className="mt-3 font-body text-body-sm text-ink-muted">
          Programs are built from structured lessons and comprehension checks. Start
          with a single lesson — you can reorder and expand the path later.
        </p>
        <Link
          href={curriculumHref}
          className="mt-8 inline-flex items-center justify-center rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on transition-colors hover:bg-accent-deep"
        >
          Add first lesson
        </Link>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
        <Link href={settingsHref} className="font-sans text-[0.88rem] text-accent hover:underline">
          Edit program details
        </Link>
        {previewEnabled ? (
          <a
            href={previewHref}
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[0.88rem] text-ink-muted hover:text-ink hover:underline"
          >
            Preview public page
          </a>
        ) : (
          <span
            className="font-sans text-[0.88rem] text-ink-faint"
            title="Available after publish"
          >
            Preview public page
          </span>
        )}
      </div>
    </div>
  );
}
