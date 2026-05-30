import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { withTenantTransaction } from "@/lib/db";
import { ConflictError, NotFoundError, UnauthorizedError } from "@/lib/errors";

export type LearnerEnrollmentRow = {
  programSlug: string;
  programTitle: string;
  tagline: string | null;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  continueLessonSlug: string | null;
};

export type ProgramEnrollmentStatus = {
  isEnrolled: boolean;
  enrolledAt: string | null;
  continueLessonSlug: string | null;
  firstLessonSlug: string | null;
};

export type CreateEnrollmentResult = {
  programSlug: string;
  firstLessonSlug: string | null;
  continueLessonSlug: string | null;
};

function requireLearnerUserId(ctx: TenantContext): string {
  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    throw new UnauthorizedError();
  }
  return ctx.userId;
}

export async function getProgramEnrollmentStatus(
  ctx: TenantContext,
  programSlug: string,
): Promise<ProgramEnrollmentStatus> {
  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    return {
      isEnrolled: false,
      enrolledAt: null,
      continueLessonSlug: null,
      firstLessonSlug: null,
    };
  }

  const userId = ctx.userId;

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      enrolled_at: Date | null;
      continue_lesson_slug: string | null;
      first_lesson_slug: string | null;
    }>(
      `select
         pe.enrolled_at,
         (
           select lv.slug
           from track t
           join lesson_version lv on lv.track_id = t.id
           left join lesson_progress lp
             on lp.lesson_version_id = lv.id and lp.user_id = $2
           where t.curriculum_version_id = pe.curriculum_version_id
             and pe.enrolled_at is not null
             and lp.completed_at is null
           order by t.position asc, lv.position asc
           limit 1
         ) as continue_lesson_slug,
         (
           select lv.slug
           from track t
           join lesson_version lv on lv.track_id = t.id
           where t.curriculum_version_id = p.active_published_version_id
           order by t.position asc, lv.position asc
           limit 1
         ) as first_lesson_slug
       from program p
       left join program_enrollment pe
         on pe.program_id = p.id and pe.user_id = $2
       where p.slug = $1
         and p.hub_status in ('listed', 'featured')
         and p.active_published_version_id is not null`,
      [programSlug, userId],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundError();
    }

    return {
      isEnrolled: row.enrolled_at !== null,
      enrolledAt: row.enrolled_at?.toISOString() ?? null,
      continueLessonSlug: row.continue_lesson_slug,
      firstLessonSlug: row.first_lesson_slug,
    };
  });
}

export async function createProgramEnrollment(
  ctx: TenantContext,
  programSlug: string,
): Promise<CreateEnrollmentResult> {
  const userId = requireLearnerUserId(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows: programRows } = await client.query<{
      id: string;
      active_published_version_id: string | null;
      organization_id: string;
    }>(
      `select id, active_published_version_id, organization_id
       from program
       where slug = $1
         and hub_status in ('listed', 'featured')
         and active_published_version_id is not null`,
      [programSlug],
    );

    const program = programRows[0];
    if (!program?.active_published_version_id) {
      throw new NotFoundError();
    }

    const { rows: existingRows } = await client.query<{ id: string }>(
      `select id
       from program_enrollment
       where user_id = $1 and program_id = $2`,
      [userId, program.id],
    );

    if (existingRows[0]) {
      throw new ConflictError("Already enrolled in this program.");
    }

    await client.query(
      `insert into program_enrollment (user_id, program_id, curriculum_version_id)
       values ($1, $2, $3)`,
      [userId, program.id, program.active_published_version_id],
    );

    const { rows: lessonRows } = await client.query<{
      first_lesson_slug: string | null;
      continue_lesson_slug: string | null;
    }>(
      `select
         (
           select lv.slug
           from track t
           join lesson_version lv on lv.track_id = t.id
           where t.curriculum_version_id = $1::uuid
           order by t.position asc, lv.position asc
           limit 1
         ) as first_lesson_slug,
         (
           select lv.slug
           from track t
           join lesson_version lv on lv.track_id = t.id
           where t.curriculum_version_id = $1::uuid
           order by t.position asc, lv.position asc
           limit 1
         ) as continue_lesson_slug`,
      [program.active_published_version_id],
    );

    const lessons = lessonRows[0];

    return {
      programSlug,
      firstLessonSlug: lessons?.first_lesson_slug ?? null,
      continueLessonSlug: lessons?.continue_lesson_slug ?? null,
    };
  });
}

export async function listLearnerEnrollments(
  ctx: TenantContext,
): Promise<LearnerEnrollmentRow[]> {
  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    return [];
  }

  const userId = ctx.userId;

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      program_slug: string;
      program_title: string;
      tagline: string | null;
      enrolled_at: Date;
      total_lessons: number;
      completed_lessons: number;
      continue_lesson_slug: string | null;
    }>(
      `select
         p.slug as program_slug,
         p.title as program_title,
         p.tagline,
         pe.enrolled_at,
         (
           select count(*)::int
           from track t
           join lesson_version lv on lv.track_id = t.id
           where t.curriculum_version_id = pe.curriculum_version_id
         ) as total_lessons,
         (
           select count(*)::int
           from lesson_progress lp
           join lesson_version lv on lv.id = lp.lesson_version_id
           join track t on t.id = lv.track_id
           where lp.user_id = pe.user_id
             and t.curriculum_version_id = pe.curriculum_version_id
             and lp.completed_at is not null
         ) as completed_lessons,
         (
           select lv.slug
           from track t
           join lesson_version lv on lv.track_id = t.id
           left join lesson_progress lp
             on lp.lesson_version_id = lv.id and lp.user_id = pe.user_id
           where t.curriculum_version_id = pe.curriculum_version_id
             and lp.completed_at is null
           order by t.position asc, lv.position asc
           limit 1
         ) as continue_lesson_slug
       from program_enrollment pe
       join program p on p.id = pe.program_id
       where pe.user_id = $1
       order by pe.enrolled_at desc`,
      [userId],
    );

    return rows.map((row) => ({
      programSlug: row.program_slug,
      programTitle: row.program_title,
      tagline: row.tagline,
      enrolledAt: row.enrolled_at.toISOString(),
      totalLessons: row.total_lessons,
      completedLessons: row.completed_lessons,
      continueLessonSlug: row.continue_lesson_slug,
    }));
  });
}
