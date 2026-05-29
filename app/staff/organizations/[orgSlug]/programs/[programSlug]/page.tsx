import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/context";
import { getStaffProgramOverview } from "@/lib/tenant/repositories/staff-programs";
import StaffProgramShell from "@/components/staff/StaffProgramShell";
import ProgramStatusChips from "@/components/staff/ProgramStatusChips";
import ProgramOverviewEmptyState from "@/components/staff/ProgramOverviewEmptyState";
import StaffFlashToast from "@/components/staff/StaffFlashToast";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string; programSlug: string }>;
};

export default async function StaffProgramOverviewPage({ params }: PageProps) {
  const { orgSlug, programSlug } = await params;
  const ctx = await resolveTenantContext();

  let overview;
  try {
    overview = await getStaffProgramOverview(ctx, { orgSlug, programSlug });
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const base = `/staff/organizations/${orgSlug}/programs/${programSlug}`;
  const previewEnabled =
    overview.activePublishedVersionId !== null &&
    (overview.hubStatus === "listed" || overview.hubStatus === "featured");

  return (
    <StaffProgramShell
      orgSlug={orgSlug}
      programSlug={programSlug}
      orgName={overview.orgName}
      programTitle={overview.title}
      active="overview"
    >
      <Suspense>
        <StaffFlashToast
          param="created"
          title="Program created"
          body="Add your first lesson to start building the curriculum."
        />
        <StaffFlashToast
          param="lessonCreated"
          title="Lesson created"
          body="You can add more lessons from the curriculum view."
        />
      </Suspense>

      <header className="md:clear-none">
        <h1 className="font-sans text-h2 text-ink">{overview.title}</h1>
        <p className="mt-2 font-sans text-[0.95rem] text-ink-muted">
          {overview.orgName} · {overview.hubStatus.replace(/_/g, " ")} program
        </p>
        <div className="mt-4">
          <ProgramStatusChips
            hubStatus={overview.hubStatus}
            draftStatus={overview.draftStatus}
            published={overview.activePublishedVersionId !== null}
          />
        </div>
      </header>

      {overview.lessonCount === 0 ? (
        <ProgramOverviewEmptyState
          curriculumHref={`${base}/curriculum`}
          settingsHref={`${base}/settings`}
          previewHref={`/programs/${programSlug}`}
          previewEnabled={previewEnabled}
        />
      ) : (
        <div className="mt-12 rounded-sm border border-rule bg-paper-deep px-8 py-10">
          <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
            Curriculum · {overview.lessonCount}{" "}
            {overview.lessonCount === 1 ? "lesson" : "lessons"}
          </p>
          <p className="mt-3 font-body text-body-sm text-ink-muted">
            Draft lessons are in progress. Open the curriculum view to add more.
          </p>
          <Link
            href={`${base}/curriculum`}
            className="mt-6 inline-flex rounded-sm bg-accent px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on hover:bg-accent-deep"
          >
            View curriculum
          </Link>
        </div>
      )}
    </StaffProgramShell>
  );
}
