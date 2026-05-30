import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { config } from "dotenv";
import path from "node:path";
import pg from "pg";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { ConflictError } from "@/lib/errors";
import {
  createProgramEnrollment,
  getProgramEnrollmentStatus,
} from "@/lib/tenant/repositories/enrollments";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const learnerA = {
  kind: "learner" as const,
  userId: "user-a",
  orgIds: [] as string[],
  isStaff: false as const,
};

const anonymous = { kind: "anonymous" as const, isStaff: false as const };

async function deleteArciumEnrollment(userId: string) {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query(`select set_config('app.is_staff', 'true', true)`);
    await client.query(
      `delete from program_enrollment pe
       using program p
       where pe.program_id = p.id
         and p.slug = 'arcium'
         and pe.user_id = $1`,
      [userId],
    );
  } finally {
    await client.end();
  }
}

describe("learner enrollment", () => {
  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    await deleteArciumEnrollment(learnerA.userId);
  });

  afterAll(async () => {
    await deleteArciumEnrollment(learnerA.userId);
  });

  it("returns not enrolled for anonymous users", async () => {
    const status = await getProgramEnrollmentStatus(anonymous, "arcium");
    expect(status.isEnrolled).toBe(false);
  });

  it("creates enrollment on explicit enroll for listed program", async () => {
    const before = await getProgramEnrollmentStatus(learnerA, "arcium");
    expect(before.isEnrolled).toBe(false);
    expect(before.firstLessonSlug).toBeTruthy();

    const created = await createProgramEnrollment(learnerA, "arcium");
    expect(created.programSlug).toBe("arcium");
    expect(created.firstLessonSlug).toBeTruthy();

    const after = await getProgramEnrollmentStatus(learnerA, "arcium");
    expect(after.isEnrolled).toBe(true);
    expect(after.continueLessonSlug).toBe(after.firstLessonSlug);

    await expect(createProgramEnrollment(learnerA, "arcium")).rejects.toBeInstanceOf(
      ConflictError,
    );
  });
});
