"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  createFirstLessonAction,
  type StaffActionResult,
} from "@/lib/staff/actions";
import { slugifyTitle } from "@/lib/slugify";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

type CreateFirstLessonFormProps = {
  orgSlug: string;
  programSlug: string;
};

export default function CreateFirstLessonForm({
  orgSlug,
  programSlug,
}: CreateFirstLessonFormProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);

  const boundAction = createFirstLessonAction.bind(null, orgSlug, programSlug);
  const [state, formAction, pending] = useActionState<
    StaffActionResult | undefined,
    FormData
  >(boundAction, undefined);

  return (
    <form action={formAction} className="mx-auto max-w-[560px]">
      <div className="rounded-sm border border-rule bg-paper-deep px-8 py-10">
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          First lesson
        </p>
        <h2 className="mt-3 font-sans text-h3 text-ink">Name your first lesson</h2>
        <p className="mt-2 font-body text-body-sm text-ink-muted">
          You will add content blocks and a quiz in a later step. For now, set a
          title and URL slug.
        </p>

        <div className="mt-8 space-y-5">
          <div>
            <label htmlFor="lesson-title" className="font-sans text-[0.88rem] text-ink">
              Lesson title
            </label>
            <input
              id="lesson-title"
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
              <p className="mt-1 font-body text-body-sm text-error">
                {state.errors.title[0]}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="lesson-slug" className="font-sans text-[0.88rem] text-ink">
              Lesson slug
            </label>
            <input
              id="lesson-slug"
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
              <p className="mt-1 font-body text-body-sm text-error">
                {state.errors.slug[0]}
              </p>
            ) : null}
          </div>
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep disabled:opacity-60"
          >
            {pending ? "Creating…" : "Create lesson"}
          </button>
          <Link
            href={`/staff/organizations/${orgSlug}/programs/${programSlug}`}
            className="px-2 py-2.5 font-sans text-[0.88rem] text-ink-muted hover:text-ink"
          >
            Back to overview
          </Link>
        </div>
      </div>
    </form>
  );
}
