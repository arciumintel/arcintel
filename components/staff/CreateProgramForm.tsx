"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { createProgramAction, type StaffActionResult } from "@/lib/staff/actions";
import { slugifyTitle } from "@/lib/slugify";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

type CreateProgramFormProps = {
  orgSlug: string;
  orgName: string;
  intakeId?: string;
  defaultTitle?: string;
  defaultSlug?: string;
};

export default function CreateProgramForm({
  orgSlug,
  orgName,
  intakeId,
  defaultTitle = "",
  defaultSlug = "",
}: CreateProgramFormProps) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultSlug));

  const boundAction = createProgramAction.bind(null, orgSlug);
  const [state, formAction, pending] = useActionState<
    StaffActionResult | undefined,
    FormData
  >(boundAction, undefined);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) {
      setSlug(slugifyTitle(value));
    }
  }

  return (
    <form action={formAction} className="mx-auto max-w-[640px]">
      {intakeId ? (
        <div className="mb-8 border-l-4 border-ochre bg-paper-deep px-4 py-3">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.14em] text-ink-soft">
            Partner intake
          </p>
          <p className="mt-1 font-sans text-[0.9rem] text-ink-muted">
            Request #{intakeId} — organization is fixed for this program.
          </p>
        </div>
      ) : null}

      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
        New program · {orgName}
      </p>
      <h1 className="mt-3 font-sans text-h2 text-ink">Create program</h1>
      <p className="mt-2 font-body text-body-sm text-ink-muted">
        Programs start internal. Hub listing and publish come later.
      </p>

      <div className="mt-10 space-y-6">
        <div>
          <label htmlFor="title" className="font-sans text-[0.88rem] text-ink">
            Program title
          </label>
          <input
            id="title"
            name="title"
            required
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className={inputClass}
          />
          {state?.errors.title ? (
            <p className="mt-1 font-body text-body-sm text-error">{state.errors.title[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="slug" className="font-sans text-[0.88rem] text-ink">
            URL slug
          </label>
          <p className="mt-1 font-mono text-[0.72rem] text-ink-soft">
            /programs/<span className="text-ink">{slug || "your-program"}</span>
          </p>
          <input
            id="slug"
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

        <div>
          <label htmlFor="tagline" className="font-sans text-[0.88rem] text-ink">
            Tagline
          </label>
          <textarea
            id="tagline"
            name="tagline"
            rows={2}
            className={inputClass}
            placeholder="Optional short description for staff and future hub listing."
          />
          {state?.errors.tagline ? (
            <p className="mt-1 font-body text-body-sm text-error">{state.errors.tagline[0]}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create program"}
        </button>
        <Link
          href={`/staff/organizations/${orgSlug}`}
          className="rounded-sm border border-rule px-5 py-2.5 font-sans text-[0.92rem] text-ink-muted hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
