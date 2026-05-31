"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  saveDraftLessonBlocksAction,
  type StaffActionResult,
} from "@/lib/staff/actions";
import type { ContentBlock } from "@/lib/content-blocks/schema";
import type { QuizQuestion, ScoringConfig } from "@/lib/quiz/schema";
import { saveDraftLessonBlocksSchema } from "@/lib/validation/staff-lesson";
import { formatLessonBlockSaveErrors } from "@/lib/validation/format-lesson-errors";
import StaffBlockForm from "@/components/staff/lesson-editor/StaffBlockForm";
import LessonEditorPreview from "@/components/staff/lesson-editor/LessonEditorPreview";
import StaffQuizEditor from "@/components/staff/lesson-editor/StaffQuizEditor";
import { createEmptyBlock } from "@/components/staff/lesson-editor/block-defaults";

const blockTypes = [
  "heading",
  "paragraph",
  "callout",
  "code",
  "image",
  "divider",
] as const;

type Tab = "content" | "quiz" | "preview";

type StaffLessonEditorProps = {
  orgSlug: string;
  programSlug: string;
  lessonSlug: string;
  lessonTitle: string;
  position: number;
  initialBlocks: ContentBlock[];
  initialQuiz: {
    questions: QuizQuestion[];
    scoringConfig: ScoringConfig;
  } | null;
  curriculumHref: string;
};

export default function StaffLessonEditor({
  orgSlug,
  programSlug,
  lessonSlug,
  lessonTitle,
  position,
  initialBlocks,
  initialQuiz,
  curriculumHref,
}: StaffLessonEditorProps) {
  const [tab, setTab] = useState<Tab>("content");
  const [blocks, setBlocks] = useState<ContentBlock[]>(initialBlocks);
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const boundSave = saveDraftLessonBlocksAction.bind(
    null,
    orgSlug,
    programSlug,
    lessonSlug,
  );
  const [state, saveAction, pending] = useActionState<
    StaffActionResult | undefined,
    FormData
  >(boundSave, undefined);

  function updateBlock(index: number, block: ContentBlock) {
    setBlocks((current) => current.map((entry, i) => (i === index ? block : entry)));
    setSaved(false);
    setValidationError(null);
  }

  function moveBlock(index: number, direction: "up" | "down") {
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= blocks.length) {
      return;
    }
    setBlocks((current) => {
      const copy = [...current];
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
      return copy;
    });
    setSaved(false);
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "content", label: "Content" },
    { key: "quiz", label: "Quiz" },
    { key: "preview", label: "Preview" },
  ];

  return (
    <div>
      <header>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          Lesson · Draft
        </p>
        <h1 className="mt-2 font-sans text-h2 text-ink">{lessonTitle}</h1>
        <p className="mt-2 font-mono text-[0.78rem] text-ink-soft">
          {lessonSlug} · position {position}
        </p>
        {!initialQuiz ? (
          <p className="mt-4 max-w-[560px] rounded-sm border-l-2 border-l-ochre bg-paper-deep px-4 py-3 font-body text-body-sm text-ink-muted">
            This lesson has no quiz yet. You can publish without one, but you will see a
            warning at publish time.
          </p>
        ) : null}
      </header>

      <div
        className="mt-10 flex flex-wrap gap-1 border-b border-rule"
        role="tablist"
        aria-label="Lesson editor"
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            type="button"
            role="tab"
            aria-selected={tab === item.key}
            onClick={() => setTab(item.key)}
            className={`px-4 py-2.5 font-sans text-[0.88rem] transition-colors ${
              tab === item.key
                ? "border-b-2 border-accent text-ink"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-8">
        {tab === "content" ? (
          <div className="space-y-6">
            {blocks.map((block, index) => (
              <section
                key={`${block.type}-${index}`}
                className="rounded-sm border border-rule bg-paper-deep px-6 py-6"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-soft">
                    Block {index + 1} · {block.type}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveBlock(index, "up")}
                      className="font-sans text-[0.82rem] text-accent disabled:opacity-40"
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => moveBlock(index, "down")}
                      className="font-sans text-[0.82rem] text-accent disabled:opacity-40"
                    >
                      Down
                    </button>
                    <button
                      type="button"
                      disabled={blocks.length <= 1}
                      onClick={() => {
                        setBlocks((current) =>
                          current.filter((_, i) => i !== index),
                        );
                        setSaved(false);
                      }}
                      className="font-sans text-[0.82rem] text-error disabled:opacity-40"
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="mt-4">
                  <StaffBlockForm
                    block={block}
                    onChange={(next) => updateBlock(index, next)}
                  />
                </div>
              </section>
            ))}

            <div className="flex flex-wrap gap-2">
              {blockTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setBlocks((current) => [...current, createEmptyBlock(type)]);
                    setSaved(false);
                  }}
                  className="rounded-sm border border-rule px-3 py-2 font-sans text-[0.82rem] text-ink hover:border-accent"
                >
                  Add {type}
                </button>
              ))}
            </div>

            <form
              action={saveAction}
              onSubmit={(event) => {
                const parsed = saveDraftLessonBlocksSchema.safeParse({ blocks });
                if (!parsed.success) {
                  event.preventDefault();
                  setSaved(false);
                  setValidationError(
                    formatLessonBlockSaveErrors(parsed.error, blocks)[0] ??
                      "Fix validation errors before saving.",
                  );
                  return;
                }
                setValidationError(null);
                setSaved(true);
              }}
              className="flex flex-wrap items-center gap-4 pt-4"
            >
              <input type="hidden" name="blocks" value={JSON.stringify(blocks)} />
              <button
                type="submit"
                disabled={pending || blocks.length === 0}
                className="rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep disabled:opacity-50"
              >
                {pending ? "Saving…" : "Save content"}
              </button>
              {validationError ? (
                <p className="font-body text-[0.85rem] text-error" role="alert">
                  {validationError}
                </p>
              ) : null}
              {state?.ok === false && state.errors.blocks ? (
                <p className="font-body text-[0.85rem] text-error" role="alert">
                  {state.errors.blocks[0]}
                </p>
              ) : null}
              {saved && !state ? (
                <p className="font-mono text-[0.72rem] text-sage">Content saved.</p>
              ) : null}
            </form>
          </div>
        ) : null}

        {tab === "quiz" ? (
          <StaffQuizEditor
            orgSlug={orgSlug}
            programSlug={programSlug}
            lessonSlug={lessonSlug}
            initialQuestions={initialQuiz?.questions ?? []}
            initialScoring={initialQuiz?.scoringConfig ?? null}
          />
        ) : null}

        {tab === "preview" ? (
          <LessonEditorPreview title={lessonTitle} blocks={blocks} />
        ) : null}
      </div>

      <p className="mt-12">
        <Link
          href={curriculumHref}
          className="font-sans text-[0.88rem] text-accent hover:underline"
        >
          Back to curriculum
        </Link>
      </p>
    </div>
  );
}
