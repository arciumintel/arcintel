"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import {
  deleteDraftLessonAction,
  reorderDraftLessonAction,
  updateDraftLessonAction,
  type StaffActionResult,
} from "@/lib/staff/actions";
import type { StaffLessonRow } from "@/lib/tenant/repositories/staff-programs";
import { slugifyTitle } from "@/lib/slugify";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

type CurriculumLessonListProps = {
  orgSlug: string;
  programSlug: string;
  lessons: StaffLessonRow[];
};

function formatPosition(position: number) {
  return String(position).padStart(2, "0");
}

function EditDraftLessonPanel({
  orgSlug,
  programSlug,
  lesson,
  onCancel,
}: {
  orgSlug: string;
  programSlug: string;
  lesson: StaffLessonRow;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState(lesson.title);
  const [slug, setSlug] = useState(lesson.slug);
  const [slugTouched, setSlugTouched] = useState(false);

  const boundAction = updateDraftLessonAction.bind(
    null,
    orgSlug,
    programSlug,
    lesson.slug,
  );
  const [state, formAction, pending] = useActionState<
    StaffActionResult | undefined,
    FormData
  >(boundAction, undefined);

  return (
    <form action={formAction} className="mt-4 rounded-sm border border-rule bg-paper px-4 py-5">
      <div className="space-y-4">
        <div>
          <label htmlFor={`edit-title-${lesson.slug}`} className="font-sans text-[0.88rem] text-ink">
            Lesson title
          </label>
          <input
            id={`edit-title-${lesson.slug}`}
            name="title"
            required
            value={title}
            onChange={(e) => {
              const value = e.target.value;
              setTitle(value);
              if (!slugTouched) {
                setSlug(slugifyTitle(value));
              }
            }}
            className={inputClass}
          />
          {state?.errors.title ? (
            <p className="mt-1 font-body text-body-sm text-error">{state.errors.title[0]}</p>
          ) : null}
        </div>
        <div>
          <label htmlFor={`edit-slug-${lesson.slug}`} className="font-sans text-[0.88rem] text-ink">
            Lesson slug
          </label>
          <input
            id={`edit-slug-${lesson.slug}`}
            name="slug"
            required
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(e.target.value);
            }}
            className={`${inputClass} font-mono`}
          />
          {state?.errors.slug ? (
            <p className="mt-1 font-body text-body-sm text-error">{state.errors.slug[0]}</p>
          ) : null}
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-accent px-4 py-2 font-sans text-[0.88rem] font-medium text-accent-on hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-2 py-2 font-sans text-[0.88rem] text-ink-muted hover:text-ink"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default function CurriculumLessonList({
  orgSlug,
  programSlug,
  lessons,
}: CurriculumLessonListProps) {
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const base = `/staff/organizations/${orgSlug}/programs/${programSlug}`;

  function handleReorder(lessonSlug: string, direction: "up" | "down") {
    setPendingSlug(lessonSlug);
    startTransition(async () => {
      await reorderDraftLessonAction(orgSlug, programSlug, lessonSlug, direction);
      setPendingSlug(null);
    });
  }

  function handleDelete(lessonSlug: string) {
    if (
      !window.confirm(
        "Delete this draft lesson? This cannot be undone.",
      )
    ) {
      return;
    }

    setPendingSlug(lessonSlug);
    startTransition(async () => {
      await deleteDraftLessonAction(orgSlug, programSlug, lessonSlug);
      setPendingSlug(null);
      if (editingSlug === lessonSlug) {
        setEditingSlug(null);
      }
    });
  }

  return (
    <ul className="border-t border-ink/20">
      {lessons.map((lesson, index) => {
        const lessonHref = `${base}/curriculum/lessons/${lesson.slug}`;
        const isRowPending = isPending && pendingSlug === lesson.slug;
        const canDelete = lessons.length > 1;

        return (
          <li key={lesson.slug} className="border-b border-ink/15 py-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[0.72rem] text-ink-soft">
                  {formatPosition(lesson.position)}
                </p>
                <Link
                  href={lessonHref}
                  className="mt-1 block font-sans text-[1rem] font-medium text-ink hover:text-accent"
                >
                  {lesson.title}
                </Link>
                <p className="mt-1 font-mono text-[0.72rem] text-ink-soft">{lesson.slug}</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={index === 0 || isRowPending}
                  onClick={() => handleReorder(lesson.slug, "up")}
                  className="px-2 py-1 font-sans text-[0.82rem] text-ink-muted hover:text-ink disabled:opacity-40"
                >
                  Up
                </button>
                <button
                  type="button"
                  disabled={index === lessons.length - 1 || isRowPending}
                  onClick={() => handleReorder(lesson.slug, "down")}
                  className="px-2 py-1 font-sans text-[0.82rem] text-ink-muted hover:text-ink disabled:opacity-40"
                >
                  Down
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setEditingSlug((current) =>
                      current === lesson.slug ? null : lesson.slug,
                    )
                  }
                  className="px-2 py-1 font-sans text-[0.82rem] text-accent hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  disabled={!canDelete || isRowPending}
                  onClick={() => handleDelete(lesson.slug)}
                  className="px-2 py-1 font-sans text-[0.82rem] text-ink-muted hover:text-error disabled:opacity-40"
                  title={canDelete ? undefined : "Programs must keep at least one draft lesson"}
                >
                  Delete
                </button>
              </div>
            </div>

            {editingSlug === lesson.slug ? (
              <EditDraftLessonPanel
                orgSlug={orgSlug}
                programSlug={programSlug}
                lesson={lesson}
                onCancel={() => setEditingSlug(null)}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
