type ProgramStatusChipsProps = {
  hubStatus: string;
  draftStatus: string;
  published: boolean;
};

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
}

function Chip({
  label,
  dotClass,
}: {
  label: string;
  dotClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-sm border border-rule bg-paper-deep px-2.5 py-1 font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-muted">
      {dotClass ? (
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden />
      ) : null}
      {label}
    </span>
  );
}

export default function ProgramStatusChips({
  hubStatus,
  draftStatus,
  published,
}: ProgramStatusChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Chip label={formatLabel(hubStatus)} dotClass="bg-accent" />
      <Chip label={formatLabel(draftStatus)} dotClass="bg-sage" />
      <Chip label={published ? "Published" : "Not published"} />
    </div>
  );
}
