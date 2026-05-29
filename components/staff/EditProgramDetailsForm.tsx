"use client";

import { useActionState } from "react";
import {
  updateProgramDetailsAction,
  type StaffActionResult,
} from "@/lib/staff/actions";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

type EditProgramDetailsFormProps = {
  orgSlug: string;
  programSlug: string;
  orgName: string;
  title: string;
  tagline: string | null;
  hubStatus: string;
};

export default function EditProgramDetailsForm({
  orgSlug,
  programSlug,
  orgName,
  title,
  tagline,
  hubStatus,
}: EditProgramDetailsFormProps) {
  const boundAction = updateProgramDetailsAction.bind(null, orgSlug, programSlug);
  const [state, formAction, pending] = useActionState<
    StaffActionResult | undefined,
    FormData
  >(boundAction, undefined);

  return (
    <form action={formAction} className="mx-auto max-w-[640px]">
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
        Settings
      </p>
      <h1 className="mt-3 font-sans text-h2 text-ink">Program details</h1>

      <dl className="mt-8 space-y-4 border-b border-rule pb-8">
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
            Organization
          </dt>
          <dd className="mt-1 font-sans text-[0.95rem] text-ink">{orgName}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
            Slug
          </dt>
          <dd className="mt-1 font-mono text-[0.88rem] text-ink">{programSlug}</dd>
        </div>
        <div>
          <dt className="font-mono text-[0.62rem] uppercase tracking-[0.12em] text-ink-soft">
            Hub status
          </dt>
          <dd className="mt-1 font-sans text-[0.95rem] text-ink">{hubStatus}</dd>
        </div>
      </dl>

      <div className="mt-8 space-y-6">
        <div>
          <label htmlFor="title" className="font-sans text-[0.88rem] text-ink">
            Program title
          </label>
          <input
            id="title"
            name="title"
            required
            defaultValue={title}
            className={inputClass}
          />
          {state?.errors.title ? (
            <p className="mt-1 font-body text-body-sm text-error">{state.errors.title[0]}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="tagline" className="font-sans text-[0.88rem] text-ink">
            Tagline
          </label>
          <textarea
            id="tagline"
            name="tagline"
            rows={3}
            defaultValue={tagline ?? ""}
            className={inputClass}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={pending}
        className="mt-10 rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
