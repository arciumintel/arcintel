import { notFound } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/context";
import {
  getStaffProgramOverview,
  getWorkspaceLessonContent,
} from "@/lib/tenant/repositories/staff-programs";
import StaffProgramShell from "@/components/staff/StaffProgramShell";
import StaffLessonEditor from "@/components/staff/lesson-editor/StaffLessonEditor";
import { NotFoundError } from "@/lib/errors";

type PageProps = {
  params: Promise<{ orgSlug: string; programSlug: string; lessonSlug: string }>;
};

export default async function StaffLessonWorkspacePage({ params }: PageProps) {
  const { orgSlug, programSlug, lessonSlug } = await params;
  const ctx = await resolveTenantContext();

  let overview;
  let content;
  try {
    overview = await getStaffProgramOverview(ctx, { orgSlug, programSlug });
    content = await getWorkspaceLessonContent(ctx, {
      orgSlug,
      programSlug,
      lessonSlug,
    });
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
      <StaffLessonEditor
        orgSlug={orgSlug}
        programSlug={programSlug}
        lessonSlug={content.slug}
        lessonTitle={content.title}
        position={content.position}
        initialBlocks={content.blocks}
        initialQuiz={content.quiz}
        curriculumHref={curriculumHref}
      />
    </StaffProgramShell>
  );
}
