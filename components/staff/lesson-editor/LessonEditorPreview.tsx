"use client";

import LessonBlockRenderer from "@/components/lessons/LessonBlockRenderer";
import type { ContentBlock } from "@/lib/content-blocks/schema";

type LessonEditorPreviewProps = {
  title: string;
  blocks: ContentBlock[];
};

export default function LessonEditorPreview({
  title,
  blocks,
}: LessonEditorPreviewProps) {
  return (
    <article className="mx-auto w-full max-w-3xl rounded-sm border border-rule bg-paper-deep px-8 py-10">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
        Preview · Draft
      </p>
      <h1 className="mt-3 font-sans text-h2 text-ink">{title || "Untitled lesson"}</h1>
      <div className="mt-10">
        {blocks.length > 0 ? (
          <LessonBlockRenderer blocks={blocks} />
        ) : (
          <p className="font-body text-body-sm text-ink-muted">
            Add at least one content block to preview the lesson.
          </p>
        )}
      </div>
    </article>
  );
}
