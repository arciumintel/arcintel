import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { config } from "dotenv";
import path from "node:path";
import pg from "pg";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { NotFoundError } from "@/lib/errors";
import type { GuestProgressPayload } from "@/lib/guest/schema";
import { mergeGuestLessonProgress } from "@/lib/tenant/repositories/guest-progress";
import { getLessonProgress } from "@/lib/tenant/repositories/lessons";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const learnerA = {
  kind: "learner" as const,
  userId: "user-a",
  orgIds: [] as string[],
  isStaff: false as const,
};

async function loadArciumFirstLessonIds() {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    const { rows } = await client.query<{
      program_id: string;
      lesson_version_id: string;
    }>(
      `select p.id as program_id, lv.id as lesson_version_id
       from program p
       join curriculum_version cv on cv.id = p.active_published_version_id
       join track t on t.curriculum_version_id = cv.id
       join lesson_version lv on lv.track_id = t.id
       where p.slug = 'arcium'
       order by t.position asc, lv.position asc
       limit 1`,
    );
    const row = rows[0];
    if (!row) {
      throw new Error("Arcium first lesson not found");
    }
    return row;
  } finally {
    await client.end();
  }
}

async function deleteLessonProgress(userId: string, lessonVersionId: string) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(`select set_config('app.is_staff', 'true', true)`);
    await client.query(
      `delete from lesson_progress where user_id = $1 and lesson_version_id = $2`,
      [userId, lessonVersionId],
    );
  } finally {
    await client.end();
  }
}

describe("guest progress merge", () => {
  let arciumIds: { program_id: string; lesson_version_id: string };

  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    arciumIds = await loadArciumFirstLessonIds();
    await deleteLessonProgress(learnerA.userId, arciumIds.lesson_version_id);
  });

  afterAll(async () => {
    await deleteLessonProgress(learnerA.userId, arciumIds.lesson_version_id);
  });

  it("imports guest lesson 1 read progress for signed-in learner", async () => {
    const payload: GuestProgressPayload = {
      schemaVersion: 2,
      programId: arciumIds.program_id,
      lessonVersionId: arciumIds.lesson_version_id,
      readAt: new Date("2026-05-29T12:00:00.000Z").toISOString(),
    };

    const result = await mergeGuestLessonProgress(learnerA, payload);
    expect(result.programSlug).toBe("arcium");
    expect(result.importedLessonProgress).toBe(true);

    const progress = await getLessonProgress(learnerA, arciumIds.lesson_version_id);
    expect(progress.startedAt).toBe("2026-05-29T12:00:00.000Z");
  });

  it("rejects merge for non-first lessons", async () => {
    const client = new pg.Client({ connectionString });
    await client.connect();
    try {
      const { rows } = await client.query<{ lesson_version_id: string }>(
        `select lv.id as lesson_version_id
         from program p
         join curriculum_version cv on cv.id = p.active_published_version_id
         join track t on t.curriculum_version_id = cv.id
         join lesson_version lv on lv.track_id = t.id
         where p.slug = 'arcium'
         order by t.position asc, lv.position asc
         offset 1
         limit 1`,
      );
      const laterLessonId = rows[0]?.lesson_version_id;
      if (!laterLessonId) return;

      const payload: GuestProgressPayload = {
        schemaVersion: 2,
        programId: arciumIds.program_id,
        lessonVersionId: laterLessonId,
        readAt: new Date().toISOString(),
      };

      await expect(mergeGuestLessonProgress(learnerA, payload)).rejects.toBeInstanceOf(
        NotFoundError,
      );
    } finally {
      await client.end();
    }
  });
});
