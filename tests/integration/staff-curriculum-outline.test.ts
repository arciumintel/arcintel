import { beforeAll, describe, expect, it } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import {
  createDraftLesson,
  createProgram,
  deleteDraftLesson,
  getWorkspaceLesson,
  listWorkspaceLessons,
  reorderDraftLesson,
  updateDraftLessonMetadata,
} from "@/lib/tenant/repositories/staff-programs";
import { AppError, ConflictError } from "@/lib/errors";
import { STAFF_TEST_ORG_SLUG, ensureStaffTestOrg } from "./helpers/staff-test-org";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const staffCtx = {
  kind: "staff" as const,
  userId: "staff-user",
  orgIds: [] as string[],
  isStaff: true as const,
};

describe("staff curriculum outline", () => {
  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    process.env.STAFF_USER_IDS = "staff-user";
    await ensureStaffTestOrg(connectionString);
  });

  it("staff adds a second draft lesson", async () => {
    const programSlug = `curriculum-b-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Curriculum B Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Lesson one",
      slug: "lesson-one",
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Lesson two",
      slug: "lesson-two",
    });

    const lessons = await listWorkspaceLessons(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
    });

    expect(lessons).toHaveLength(2);
    expect(lessons.map((lesson) => lesson.slug)).toEqual(["lesson-one", "lesson-two"]);
    expect(lessons[0].position).toBe(1);
    expect(lessons[1].position).toBe(2);
  });

  it("reorders a draft lesson down", async () => {
    const programSlug = `curriculum-reorder-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Reorder Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "First",
      slug: "first",
    });
    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Second",
      slug: "second",
    });

    await reorderDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug: "first",
      direction: "down",
    });

    const lessons = await listWorkspaceLessons(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
    });

    expect(lessons.map((lesson) => lesson.slug)).toEqual(["second", "first"]);
  });

  it("updates draft lesson metadata", async () => {
    const programSlug = `curriculum-update-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Update Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Original title",
      slug: "original-slug",
    });

    const updated = await updateDraftLessonMetadata(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug: "original-slug",
      title: "Updated title",
      slug: "updated-slug",
    });

    expect(updated.slug).toBe("updated-slug");

    const lesson = await getWorkspaceLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug: "updated-slug",
    });

    expect(lesson.title).toBe("Updated title");
    expect(lesson.slug).toBe("updated-slug");
  });

  it("deletes a draft lesson when two or more exist", async () => {
    const programSlug = `curriculum-delete-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Delete Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Keep",
      slug: "keep",
    });
    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Remove",
      slug: "remove",
    });

    await deleteDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug: "remove",
    });

    const lessons = await listWorkspaceLessons(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
    });

    expect(lessons).toHaveLength(1);
    expect(lessons[0].slug).toBe("keep");
    expect(lessons[0].position).toBe(1);
  });

  it("blocks deleting the last draft lesson", async () => {
    const programSlug = `curriculum-last-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Last Lesson Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Only lesson",
      slug: "only-lesson",
    });

    await expect(
      deleteDraftLesson(staffCtx, {
        orgSlug: STAFF_TEST_ORG_SLUG,
        programSlug,
        lessonSlug: "only-lesson",
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("rejects duplicate lesson slug on create", async () => {
    const programSlug = `curriculum-dup-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Dup Lesson Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Lesson A",
      slug: "shared-slug",
    });

    await expect(
      createDraftLesson(staffCtx, {
        orgSlug: STAFF_TEST_ORG_SLUG,
        programSlug,
        title: "Lesson B",
        slug: "shared-slug",
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });
});
