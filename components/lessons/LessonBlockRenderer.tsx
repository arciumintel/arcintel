import type { ContentBlock } from "@/lib/content-blocks/schema";

/**
 * Sanitised renderer for the v1 block set: heading | paragraph | callout |
 * code | image | divider. No raw HTML, no Markdoc — each block is a typed
 * leaf with deterministic mapping to JSX.
 */
export default function LessonBlockRenderer({ blocks }: { blocks: ContentBlock[] }) {
  return (
    <div className="space-y-6">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  );
}

function Block({ block }: { block: ContentBlock }) {
  if (block.type === "heading") {
    if (block.level === 2) {
      return (
        <h2 className="mt-10 font-sans text-[1.55rem] font-bold tracking-[-0.025em] text-ink md:text-[1.85rem]">
          {block.text.en}
        </h2>
      );
    }
    return (
      <h3 className="mt-8 font-sans text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">
        {block.text.en}
      </h3>
    );
  }

  if (block.type === "paragraph") {
    return (
      <p className="font-sans text-[1.04rem] leading-[1.65] text-ink md:text-[1.08rem]">
        {block.text.en}
      </p>
    );
  }

  if (block.type === "callout") {
    const variantColor =
      block.variant === "warning"
        ? "border-l-accent text-ink"
        : "border-l-ochre text-ink-muted";
    return (
      <aside
        className={`my-6 border-l-2 ${variantColor} bg-paper-deep px-5 py-4 font-sans text-[0.98rem] leading-[1.6]`}
      >
        <span
          aria-hidden
          className="mb-1 block font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink-soft"
        >
          {block.variant === "warning" ? "Caution" : "Note"}
        </span>
        {block.text.en}
      </aside>
    );
  }

  if (block.type === "code") {
    return (
      <div className="my-6 overflow-hidden border border-ink/15 bg-paper-shade">
        <header className="flex items-center justify-between border-b border-ink/10 px-3 py-1.5 font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-soft">
          <span>{block.language}</span>
          <span>snippet</span>
        </header>
        <pre className="overflow-x-auto px-4 py-3 font-mono text-[0.82rem] leading-[1.65] text-ink">
          {block.snippet}
        </pre>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <figure className="my-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={block.cloudinary_url}
          alt={block.alt.en}
          className="block w-full border border-ink/15"
        />
        {block.caption ? (
          <figcaption className="mt-3 text-center font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
            {block.caption.en}
          </figcaption>
        ) : null}
      </figure>
    );
  }

  if (block.type === "divider") {
    return (
      <div className="my-8 flex items-center justify-center" aria-hidden>
        <span className="block h-px w-12 bg-ink/20" />
      </div>
    );
  }

  return null;
}
