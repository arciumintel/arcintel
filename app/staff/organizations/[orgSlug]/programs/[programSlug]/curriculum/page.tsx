import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { resolveTenantContext } from "@/lib/tenant/context";
import {
  getStaffProgramOverview,
  listWorkspaceLessons,
} from "@/lib/tenant/repositories/staff-programs";
import StaffProgramShell from "@/components/staff/StaffProgramShell";
import CreateDraftLessonForm from "@/components/staff/CreateDraftLessonForm";
import CurriculumLessonList from "@/components/staff/CurriculumLessonList";
import StaffFlashToast from "@/components/staff/StaffFlashToast";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string; programSlug: string }>;
};

export default async function StaffProgramCurriculumPage({ params }: PageProps) {
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

  const lessons = await listWorkspaceLessons(ctx, { orgSlug, programSlug });

  return (
    <StaffProgramShell
      orgSlug={orgSlug}
      programSlug={programSlug}
      orgName={overview.orgName}
      programTitle={overview.title}
      active="curriculum"
    >
      <Suspense>
        <StaffFlashToast
          param="lessonCreated"
          title="Lesson created"
          body="You can reorder lessons or add another below."
        />
      </Suspense>

      <header>
        <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
          Curriculum · Draft · {lessons.length}{" "}
          {lessons.length === 1 ? "lesson" : "lessons"}
        </p>
        <h1 className="mt-2 font-sans text-h2 text-ink">{overview.title}</h1>
      </header>

      {lessons.length === 0 ? (
        <div className="mt-12">
          <CreateDraftLessonForm
            orgSlug={orgSlug}
            programSlug={programSlug}
            variant="first"
          />
        </div>
      ) : (
        <div className="mt-12">
          <CurriculumLessonList
            orgSlug={orgSlug}
            programSlug={programSlug}
            lessons={lessons}
          />
          <CreateDraftLessonForm
            orgSlug={orgSlug}
            programSlug={programSlug}
            variant="add"
          />
        </div>
      )}
    </StaffProgramShell>
  );
}
