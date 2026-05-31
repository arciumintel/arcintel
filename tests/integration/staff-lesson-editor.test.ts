import { beforeAll, describe, expect, it } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import type { ContentBlock } from "@/lib/content-blocks/schema";
import {
  clearDraftLessonQuiz,
  createDraftLesson,
  createProgram,
  getWorkspaceLessonContent,
  updateDraftLessonBlocks,
  upsertDraftLessonQuiz,
} from "@/lib/tenant/repositories/staff-programs";
import { AppError } from "@/lib/errors";
import { STAFF_TEST_ORG_SLUG, ensureStaffTestOrg } from "./helpers/staff-test-org";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

const staffCtx = {
  kind: "staff" as const,
  userId: "staff-user",
  orgIds: [] as string[],
  isStaff: true as const,
};

const sampleBlocks: ContentBlock[] = [
  { type: "heading", level: 2, text: { en: "Intro" } },
  { type: "paragraph", text: { en: "Body copy for the draft lesson." } },
];

const sampleQuiz = {
  questions: [
    {
      id: "q1",
      type: "true_false" as const,
      prompt: "Arcademy stores lesson content in Postgres.",
      points: 1,
      correctAnswer: "true" as const,
    },
  ],
  scoringConfig: {
    passThreshold: 70,
    masteryThreshold: 90,
    maxAttempts: 3,
    cooldownSeconds: 0,
  },
};

describe("staff lesson editor", () => {
  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    process.env.STAFF_USER_IDS = "staff-user";
    await ensureStaffTestOrg(connectionString);
  });

  async function seedProgram(lessonSlug: string) {
    const programSlug = `lesson-editor-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Lesson Editor Test",
      slug: programSlug,
      tagline: null,
    });

    await createDraftLesson(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      title: "Editable lesson",
      slug: lessonSlug,
    });

    return programSlug;
  }

  it("reads draft lesson blocks and empty quiz", async () => {
    const lessonSlug = "read-blocks";
    const programSlug = await seedProgram(lessonSlug);

    const content = await getWorkspaceLessonContent(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
    });

    expect(content.slug).toBe(lessonSlug);
    expect(content.blocks.length).toBeGreaterThanOrEqual(1);
    expect(content.blocks[0].type).toBe("paragraph");
    expect(content.quiz).toBeNull();
  });

  it("persists block updates on the draft lesson", async () => {
    const lessonSlug = "save-blocks";
    const programSlug = await seedProgram(lessonSlug);

    await updateDraftLessonBlocks(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
      blocks: sampleBlocks,
    });

    const content = await getWorkspaceLessonContent(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
    });

    expect(content.blocks).toEqual(sampleBlocks);
  });

  it("upserts and clears draft quiz", async () => {
    const lessonSlug = "save-quiz";
    const programSlug = await seedProgram(lessonSlug);

    await upsertDraftLessonQuiz(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
      ...sampleQuiz,
    });

    let content = await getWorkspaceLessonContent(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
    });

    expect(content.quiz?.questions).toHaveLength(1);
    expect(content.quiz?.scoringConfig.passThreshold).toBe(70);

    await upsertDraftLessonQuiz(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
      questions: [
        ...sampleQuiz.questions,
        {
          id: "q2",
          type: "short_text" as const,
          prompt: "What database does Arcademy use?",
          points: 1,
          correctAnswer: "Postgres",
        },
      ],
      scoringConfig: sampleQuiz.scoringConfig,
    });

    content = await getWorkspaceLessonContent(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
    });
    expect(content.quiz?.questions).toHaveLength(2);

    await clearDraftLessonQuiz(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
    });

    content = await getWorkspaceLessonContent(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      programSlug,
      lessonSlug,
    });
    expect(content.quiz).toBeNull();
  });

  it("rejects disallowed image URLs in blocks", async () => {
    const lessonSlug = "bad-image";
    const programSlug = await seedProgram(lessonSlug);

    await expect(
      updateDraftLessonBlocks(staffCtx, {
        orgSlug: STAFF_TEST_ORG_SLUG,
        programSlug,
        lessonSlug,
        blocks: [
          {
            type: "image",
            cloudinary_url:
              "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
            alt: { en: "Bad" },
          },
        ],
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
