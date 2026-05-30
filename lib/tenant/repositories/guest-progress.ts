import type { PoolClient } from "pg";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import type { GuestProgressPayload } from "@/lib/guest/schema";
import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { withTenantTransaction } from "@/lib/db";

export type GuestMergeResult = {
  ok: true;
  programSlug: string;
  importedLessonProgress: boolean;
  importedQuizAttempt: boolean;
};

async function assertGuestMergeTarget(
  client: PoolClient,
  payload: GuestProgressPayload,
): Promise<{
  programSlug: string;
  quizVersionId: string | null;
}> {
  const { rows } = await client.query<{
    program_slug: string;
    quiz_version_id: string | null;
  }>(
    `select p.slug as program_slug,
            lv.quiz_version_id
     from program p
     join curriculum_version cv on cv.id = p.active_published_version_id
     join track t on t.curriculum_version_id = cv.id
     join lesson_version lv on lv.track_id = t.id
     where p.id = $1
       and lv.id = $2
       and p.hub_status in ('listed', 'featured')
       and p.active_published_version_id is not null
       and lv.id = (
         select lv2.id
         from track t2
         join lesson_version lv2 on lv2.track_id = t2.id
         where t2.curriculum_version_id = cv.id
         order by t2.position asc, lv2.position asc
         limit 1
       )`,
    [payload.programId, payload.lessonVersionId],
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError();
  }

  return {
    programSlug: row.program_slug,
    quizVersionId: row.quiz_version_id,
  };
}

export async function mergeGuestLessonProgress(
  ctx: TenantContext,
  payload: GuestProgressPayload,
): Promise<GuestMergeResult> {
  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    throw new ForbiddenError();
  }

  const readAt = new Date(payload.readAt);
  if (Number.isNaN(readAt.getTime())) {
    throw new ForbiddenError("Invalid guest read timestamp.");
  }

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const target = await assertGuestMergeTarget(client, payload);
    const userId = ctx.userId;

    await client.query(
      `insert into lesson_progress (user_id, lesson_version_id, started_at, completed_at)
       values ($1, $2, $3, $4)
       on conflict (user_id, lesson_version_id)
       do update set
         started_at = coalesce(lesson_progress.started_at, excluded.started_at),
         completed_at = coalesce(excluded.completed_at, lesson_progress.completed_at)`,
      [
        userId,
        payload.lessonVersionId,
        readAt,
        payload.quizAttempt?.passed
          ? new Date(payload.quizAttempt.submittedAt)
          : null,
      ],
    );

    let importedQuizAttempt = false;

    if (payload.quizAttempt && target.quizVersionId) {
      const { rows: existingRows } = await client.query<{ score: string }>(
        `select score
         from quiz_attempt
         where user_id = $1 and quiz_version_id = $2
         order by submitted_at desc
         limit 1`,
        [ctx.userId, target.quizVersionId],
      );

      const existingScore = existingRows[0] ? Number(existingRows[0].score) : null;
      const guestScore = payload.quizAttempt.score;

      if (existingScore === null || guestScore > existingScore) {
        await client.query(
          `insert into quiz_attempt (user_id, quiz_version_id, answers, score, passed)
           values ($1, $2, $3::jsonb, $4, $5)`,
          [
            ctx.userId,
            target.quizVersionId,
            JSON.stringify({ source: "guest_merge", schemaVersion: payload.schemaVersion }),
            guestScore,
            payload.quizAttempt.passed,
          ],
        );
        importedQuizAttempt = true;
      }
    }

    return {
      ok: true,
      programSlug: target.programSlug,
      importedLessonProgress: true,
      importedQuizAttempt,
    };
  });
}
