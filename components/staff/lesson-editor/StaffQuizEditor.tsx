"use client";

import { useActionState, useState } from "react";
import {
  clearDraftLessonQuizAction,
  saveDraftLessonQuizAction,
  type StaffActionResult,
} from "@/lib/staff/actions";
import type { QuizQuestion, ScoringConfig } from "@/lib/quiz/schema";
import {
  createEmptyQuestion,
  defaultScoringConfig,
} from "@/components/staff/lesson-editor/block-defaults";
import StaffImageUploadField from "@/components/staff/lesson-editor/StaffImageUploadField";
import { QUIZ_IMAGE_UPLOAD_HINT } from "@/lib/media/lesson-image-spec";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

const textareaClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] leading-relaxed text-ink outline-none transition-colors focus:border-accent";

type StaffQuizEditorProps = {
  orgSlug: string;
  programSlug: string;
  lessonSlug: string;
  initialQuestions: QuizQuestion[];
  initialScoring: ScoringConfig | null;
};

export default function StaffQuizEditor({
  orgSlug,
  programSlug,
  lessonSlug,
  initialQuestions,
  initialScoring,
}: StaffQuizEditorProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>(
    initialQuestions.length > 0 ? initialQuestions : [],
  );
  const [scoring, setScoring] = useState<ScoringConfig>(
    initialScoring ?? defaultScoringConfig(),
  );
  const [saved, setSaved] = useState(false);

  const boundSave = saveDraftLessonQuizAction.bind(
    null,
    orgSlug,
    programSlug,
    lessonSlug,
  );
  const [state, saveAction, pending] = useActionState<
    StaffActionResult | undefined,
    FormData
  >(boundSave, undefined);

  function updateQuestion(index: number, next: QuizQuestion) {
    setQuestions((current) =>
      current.map((question, i) => (i === index ? next : question)),
    );
    setSaved(false);
  }

  function moveQuestion(index: number, direction: "up" | "down") {
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= questions.length) {
      return;
    }
    setQuestions((current) => {
      const copy = [...current];
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
      return copy;
    });
    setSaved(false);
  }

  return (
    <div className="space-y-8">
      {questions.length === 0 ? (
        <div className="rounded-sm border border-dashed border-rule bg-paper-deep px-6 py-8">
          <p className="font-body text-body-sm text-ink-muted">
            No quiz yet. Quizzes are optional before publish — you will get a warning
            if a lesson ships without one.
          </p>
        </div>
      ) : null}

      {questions.map((question, index) => (
        <section
          key={question.id}
          className="rounded-sm border border-rule bg-paper-deep px-6 py-6"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-soft">
              Question {index + 1} · {question.type.replace("_", " ")}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => moveQuestion(index, "up")}
                className="font-sans text-[0.82rem] text-accent disabled:opacity-40"
              >
                Up
              </button>
              <button
                type="button"
                disabled={index === questions.length - 1}
                onClick={() => moveQuestion(index, "down")}
                className="font-sans text-[0.82rem] text-accent disabled:opacity-40"
              >
                Down
              </button>
              <button
                type="button"
                onClick={() => {
                  setQuestions((current) =>
                    current.filter((_, i) => i !== index),
                  );
                  setSaved(false);
                }}
                className="font-sans text-[0.82rem] text-error"
              >
                Remove
              </button>
            </div>
          </div>

          <label className="mt-4 block">
            <span className="font-sans text-[0.82rem] text-ink-muted">Prompt</span>
            <textarea
              rows={3}
              value={question.prompt}
              onChange={(event) =>
                updateQuestion(index, { ...question, prompt: event.target.value })
              }
              className={textareaClass}
            />
          </label>

          {question.type === "multiple_choice" ? (
            <div className="mt-4 space-y-3">
              <p className="font-sans text-[0.82rem] text-ink-muted">Options</p>
              {question.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  type="text"
                  value={option}
                  onChange={(event) => {
                    const options = [...question.options];
                    options[optionIndex] = event.target.value;
                    updateQuestion(index, { ...question, options });
                  }}
                  className={inputClass}
                />
              ))}
              <button
                type="button"
                onClick={() =>
                  updateQuestion(index, {
                    ...question,
                    options: [...question.options, ""],
                  })
                }
                className="font-sans text-[0.82rem] text-accent"
              >
                Add option
              </button>
              <label className="block">
                <span className="font-sans text-[0.82rem] text-ink-muted">
                  Correct answer (must match an option)
                </span>
                <input
                  type="text"
                  value={question.correctAnswer}
                  onChange={(event) =>
                    updateQuestion(index, {
                      ...question,
                      correctAnswer: event.target.value,
                    })
                  }
                  className={inputClass}
                />
              </label>
            </div>
          ) : null}

          {question.type === "short_text" ? (
            <label className="mt-4 block">
              <span className="font-sans text-[0.82rem] text-ink-muted">
                Correct answer
              </span>
              <input
                type="text"
                value={question.correctAnswer}
                onChange={(event) =>
                  updateQuestion(index, {
                    ...question,
                    correctAnswer: event.target.value,
                  })
                }
                className={inputClass}
              />
            </label>
          ) : null}

          {question.type === "true_false" ? (
            <label className="mt-4 block">
              <span className="font-sans text-[0.82rem] text-ink-muted">
                Correct answer
              </span>
              <select
                value={question.correctAnswer}
                onChange={(event) =>
                  updateQuestion(index, {
                    ...question,
                    correctAnswer: event.target.value as "true" | "false",
                  })
                }
                className={inputClass}
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
            </label>
          ) : null}

          <div className="mt-6 border-t border-rule pt-4">
            <StaffImageUploadField
              label="Optional illustration"
              uploadHint={QUIZ_IMAGE_UPLOAD_HINT}
              value={question.image?.cloudinary_url ?? ""}
              altValue={question.image?.alt.en ?? ""}
              onUrlChange={(cloudinary_url) => {
                if (!cloudinary_url) {
                  const { image: _removed, ...rest } = question;
                  updateQuestion(index, rest as QuizQuestion);
                  return;
                }
                updateQuestion(index, {
                  ...question,
                  image: {
                    cloudinary_url,
                    alt: { en: question.image?.alt.en ?? "" },
                  },
                });
              }}
              onAltChange={(en) => {
                if (!question.image) {
                  return;
                }
                updateQuestion(index, {
                  ...question,
                  image: { ...question.image, alt: { en } },
                });
              }}
            />
          </div>
        </section>
      ))}

      <div className="flex flex-wrap gap-2">
        {(["true_false", "multiple_choice", "short_text"] as const).map((type) => (
          <button
            key={type}
            type="button"
            onClick={() => {
              setQuestions((current) => [...current, createEmptyQuestion(type)]);
              setSaved(false);
            }}
            className="rounded-sm border border-rule px-3 py-2 font-sans text-[0.82rem] text-ink hover:border-accent"
          >
            Add {type.replace("_", " ")}
          </button>
        ))}
      </div>

      <section className="rounded-sm border border-rule bg-paper-deep px-6 py-6">
        <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-soft">
          Scoring
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="font-sans text-[0.82rem] text-ink-muted">Pass %</span>
            <input
              type="number"
              min={0}
              max={100}
              value={scoring.passThreshold}
              onChange={(event) =>
                setScoring({ ...scoring, passThreshold: Number(event.target.value) })
              }
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="font-sans text-[0.82rem] text-ink-muted">Mastery %</span>
            <input
              type="number"
              min={0}
              max={100}
              value={scoring.masteryThreshold}
              onChange={(event) =>
                setScoring({
                  ...scoring,
                  masteryThreshold: Number(event.target.value),
                })
              }
              className={inputClass}
            />
          </label>
          <label className="block">
            <span className="font-sans text-[0.82rem] text-ink-muted">Max attempts</span>
            <input
              type="number"
              min={1}
              max={20}
              value={scoring.maxAttempts}
              onChange={(event) =>
                setScoring({ ...scoring, maxAttempts: Number(event.target.value) })
              }
              className={inputClass}
            />
          </label>
        </div>
      </section>

      <form
        action={saveAction}
        onSubmit={() => setSaved(true)}
        className="flex flex-wrap items-center gap-4"
      >
        <input type="hidden" name="quiz" value={JSON.stringify({ questions, scoringConfig: scoring })} />
        <button
          type="submit"
          disabled={pending || questions.length === 0}
          className="rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep disabled:opacity-50"
        >
          {pending ? "Saving…" : "Save quiz"}
        </button>
        {state?.ok === false && state.errors.quiz ? (
          <p className="font-body text-[0.85rem] text-error">{state.errors.quiz[0]}</p>
        ) : null}
        {saved && !state ? (
          <p className="font-mono text-[0.72rem] text-sage">Quiz saved.</p>
        ) : null}
      </form>

      {questions.length > 0 ? (
        <form
          action={clearDraftLessonQuizAction.bind(
            null,
            orgSlug,
            programSlug,
            lessonSlug,
          )}
        >
          <button
            type="submit"
            className="font-sans text-[0.82rem] text-error hover:underline"
          >
            Remove quiz from lesson
          </button>
        </form>
      ) : null}
    </div>
  );
}
