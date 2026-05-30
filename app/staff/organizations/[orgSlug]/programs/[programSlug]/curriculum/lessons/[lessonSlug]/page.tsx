import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/context";
import {
  getStaffProgramOverview,
  getWorkspaceLesson,
} from "@/lib/tenant/repositories/staff-programs";
import StaffProgramShell from "@/components/staff/StaffProgramShell";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string; programSlug: string; lessonSlug: string }>;
};

export default async function StaffLessonWorkspacePage({ params }: PageProps) {
  const { orgSlug, programSlug, lessonSlug } = await params;
  const ctx = await resolveTenantContext();

  let overview;
  let lesson;
  try {
    overview = await getStaffProgramOverview(ctx, { orgSlug, programSlug });
    lesson = await getWorkspaceLesson(ctx, { orgSlug, programSlug, lessonSlug });
  } catch (error) {
    if (error instanceof NotFoundError) {
      notFound();
    }
    throw error;
  }

  const curriculumHref = `/staff/organizations/${orgSlug}/programs/${programSlug}/curriculum`;

  return (
    <StaffProgramShell
      orgSlug={orgSlug}
      programSlug={programSlug}
      orgName={overview.orgName}
      programTitle={overview.title}
      active="curriculum"
    >
      <header>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          Lesson · Draft
        </p>
        <h1 className="mt-2 font-sans text-h2 text-ink">{lesson.title}</h1>
        <p className="mt-2 font-mono text-[0.78rem] text-ink-soft">
          {lesson.slug} · position {lesson.position}
        </p>
      </header>

      <div className="mt-12 max-w-[560px] rounded-sm border border-rule bg-paper-deep px-8 py-10">
        <p className="font-body text-body-sm text-ink-muted">
          Content editor ships next. Blocks and quizzes will be editable here.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            disabled
            className="cursor-not-allowed rounded-sm bg-accent/40 px-5 py-2.5 font-sans text-[0.92rem] font-medium text-accent-on"
          >
            Edit content
          </button>
          <Link
            href={curriculumHref}
            className="px-2 py-2.5 font-sans text-[0.88rem] text-accent hover:underline"
          >
            Back to curriculum
          </Link>
        </div>
      </div>
    </StaffProgramShell>
  );
}
