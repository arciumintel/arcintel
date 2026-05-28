import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { withTenantTransaction } from "@/lib/db";

export type LearnerEnrollmentRow = {
  programSlug: string;
  programTitle: string;
  tagline: string | null;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  continueLessonSlug: string | null;
};

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
