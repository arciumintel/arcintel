import { describe, it, expect, beforeAll } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { getLessonProgress, upsertLessonProgress } from "@/lib/tenant/repositories/lessons";
import {
  getPublishedLessonVersion,
  getProgramBySlug,
  listListedPrograms,
} from "@/lib/tenant/repositories/programs";
import { listLearnerEnrollments } from "@/lib/tenant/repositories/enrollments";
import { requireOrganizationAccess } from "@/lib/tenant/scope";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
import {
  ISOLATION_PROGRAM_SLUG,
  ISOLATION_USERS,
  seedIsolationFixtures,
  type IsolationFixtureIds,
} from "./helpers/isolation-fixtures";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const learnerA = {
  kind: "learner" as const,
  userId: ISOLATION_USERS.userA,
  orgIds: [] as string[],
  isStaff: false as const,
};

const learnerB = {
  kind: "learner" as const,
  userId: ISOLATION_USERS.userB,
  orgIds: [] as string[],
  isStaff: false as const,
};

const anonymous = { kind: "anonymous" as const, isStaff: false as const };

let fixtures: IsolationFixtureIds;

describe("tenant isolation", () => {
  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    fixtures = await seedIsolationFixtures(connectionString);
  });

  it("user A cannot read user B lesson progress", async () => {
    await expect(getLessonProgress(learnerA, fixtures.lessonVersionId)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("user A can read own lesson progress after upsert", async () => {
    await upsertLessonProgress(learnerA, {
      lessonVersionId: fixtures.lessonVersionId,
      startedAt: new Date(),
    });

    const progress = await getLessonProgress(learnerA, fixtures.lessonVersionId);
    expect(progress.userId).toBe(ISOLATION_USERS.userA);
  });

  it("anonymous cannot read lesson progress", async () => {
    await expect(getLessonProgress(anonymous, fixtures.lessonVersionId)).rejects.toBeInstanceOf(
      ForbiddenError,
    );
  });

  it("anonymous can read listed published lessons", async () => {
    const lesson = await getPublishedLessonVersion(anonymous, {
      programSlug: "arcium",
      lessonSlug: "welcome",
    });
    expect(lesson.slug).toBe("welcome");
    expect(lesson.blocks.length).toBeGreaterThan(0);
    expect(lesson.quiz?.questions[0]).not.toHaveProperty("correctAnswer");
  });

  it("lists arcium on the public catalog", async () => {
    const programs = await listListedPrograms(anonymous);
    expect(programs.some((program) => program.slug === "arcium")).toBe(true);
    expect(programs.some((program) => program.slug === ISOLATION_PROGRAM_SLUG)).toBe(
      false,
    );
  });

  it("anonymous cannot read internal program metadata", async () => {
    await expect(getProgramBySlug(anonymous, ISOLATION_PROGRAM_SLUG)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("learner without org membership cannot read internal program metadata", async () => {
    await expect(getProgramBySlug(learnerA, ISOLATION_PROGRAM_SLUG)).rejects.toBeInstanceOf(
      NotFoundError,
    );
  });

  it("anonymous cannot read unpublished partner program lessons", async () => {
    await expect(
      getPublishedLessonVersion(anonymous, {
        programSlug: ISOLATION_PROGRAM_SLUG,
        lessonSlug: "draft-lesson",
      }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("learner A cannot access partner B organization scope", async () => {
    await expect(
      requireOrganizationAccess(learnerA, fixtures.partnerOrgId, "read"),
    ).rejects.toBeInstanceOf(ForbiddenError);
  });

  it("partner B member can access partner B organization scope", async () => {
    await expect(
      requireOrganizationAccess(
        {
          kind: "learner",
          userId: ISOLATION_USERS.partnerMember,
          orgIds: [fixtures.partnerOrgId],
          isStaff: false,
        },
        fixtures.partnerOrgId,
        "read",
      ),
    ).resolves.toBeUndefined();
  });

  it("user A enrollments do not include user B program enrollments", async () => {
    const enrollmentsA = await listLearnerEnrollments(learnerA);
    const enrollmentsB = await listLearnerEnrollments(learnerB);

    expect(enrollmentsA.some((row) => row.programSlug === "arcium")).toBe(false);
    expect(enrollmentsB.some((row) => row.programSlug === "arcium")).toBe(true);
  });
});
