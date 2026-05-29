import { ForbiddenError, NotFoundError } from "@/lib/errors";
import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { withTenantTransaction } from "@/lib/db";

export type LessonProgressRow = {
  userId: string;
  lessonVersionId: string;
  startedAt: string | null;
  completedAt: string | null;
};

export async function getLessonProgress(
  ctx: TenantContext,
  lessonVersionId: string,
): Promise<LessonProgressRow> {
  if (ctx.kind === "anonymous") {
    throw new ForbiddenError();
  }

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const scopedToUser =
      ctx.kind !== "staff" && ctx.kind !== "system" ? ctx.userId : null;

    const { rows } = await client.query<{
      user_id: string;
      lesson_version_id: string;
      started_at: Date | null;
      completed_at: Date | null;
    }>(
      scopedToUser
        ? `select user_id, lesson_version_id, started_at, completed_at
           from lesson_progress
           where lesson_version_id = $1 and user_id = $2`
        : `select user_id, lesson_version_id, started_at, completed_at
           from lesson_progress
           where lesson_version_id = $1`,
      scopedToUser ? [lessonVersionId, scopedToUser] : [lessonVersionId],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundError();
    }

    return {
      userId: row.user_id,
      lessonVersionId: row.lesson_version_id,
      startedAt: row.started_at?.toISOString() ?? null,
      completedAt: row.completed_at?.toISOString() ?? null,
    };
  });
}

export async function upsertLessonProgress(
  ctx: TenantContext,
  input: {
    lessonVersionId: string;
    startedAt?: Date;
    completedAt?: Date;
  },
) {
  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    throw new ForbiddenError();
  }

  const userId = ctx.userId;

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    await client.query(
      `insert into lesson_progress (user_id, lesson_version_id, started_at, completed_at)
       values ($1, $2, $3, $4)
       on conflict (user_id, lesson_version_id)
       do update set
         started_at = coalesce(lesson_progress.started_at, excluded.started_at),
         completed_at = coalesce(excluded.completed_at, lesson_progress.completed_at)`,
      [
        userId,
        input.lessonVersionId,
        input.startedAt ?? null,
        input.completedAt ?? null,
      ],
    );
  });
}
