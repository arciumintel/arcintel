import Link from "next/link";
import { notFound } from "next/navigation";
import { resolveTenantContext } from "@/lib/tenant/context";
import {
  getStaffProgramOverview,
  listWorkspaceLessons,
} from "@/lib/tenant/repositories/staff-programs";
import StaffProgramShell from "@/components/staff/StaffProgramShell";
import CreateFirstLessonForm from "@/components/staff/CreateFirstLessonForm";
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

  const lessons =
    overview.lessonCount > 0
      ? await listWorkspaceLessons(ctx, { orgSlug, programSlug })
      : [];

  const base = `/staff/organizations/${orgSlug}/programs/${programSlug}`;

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
          Curriculum · Draft
        </p>
        <h1 className="mt-2 font-sans text-h2 text-ink">{overview.title}</h1>
      </header>

      {lessons.length === 0 ? (
        <div className="mt-12">
          <CreateFirstLessonForm orgSlug={orgSlug} programSlug={programSlug} />
        </div>
      ) : (
        <div className="mt-12">
          <ul className="border-t border-ink/20">
            {lessons.map((lesson) => (
              <li key={lesson.slug} className="border-b border-ink/15 py-6">
                <p className="font-sans text-[1rem] font-medium text-ink">{lesson.title}</p>
                <p className="mt-1 font-mono text-[0.72rem] text-ink-soft">{lesson.slug}</p>
              </li>
            ))}
          </ul>
          <Link
            href={base}
            className="mt-8 inline-block font-sans text-[0.88rem] text-accent hover:underline"
          >
            Back to overview
          </Link>
        </div>
      )}
    </StaffProgramShell>
  );
}
