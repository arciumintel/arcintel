import { describe, it, expect, vi, beforeAll } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import type { TenantContext } from "@/lib/tenant/context";

vi.mock("@/lib/tenant/context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tenant/context")>();
  return {
    ...actual,
    resolveTenantContext: vi.fn(),
  };
});

import { resolveTenantContext } from "@/lib/tenant/context";
import {
  ISOLATION_PROGRAM_SLUG,
  ISOLATION_USERS,
  seedIsolationFixtures,
} from "./helpers/isolation-fixtures";
import { GET as getProgram } from "@/app/api/v1/programs/[slug]/route";
import { GET as getLesson } from "@/app/api/v1/programs/[slug]/lessons/[lessonSlug]/route";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

function mockContext(ctx: TenantContext) {
  vi.mocked(resolveTenantContext).mockResolvedValue(ctx);
}

const learnerA: TenantContext = {
  kind: "learner",
  userId: ISOLATION_USERS.userA,
  orgIds: [],
  isStaff: false,
};

const anonymous: TenantContext = { kind: "anonymous", isStaff: false };

describe("tenant isolation API routes", () => {
  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    await seedIsolationFixtures(connectionString);
  });

  it("returns 404 JSON for learner access to internal program", async () => {
    mockContext(learnerA);
    const response = await getProgram(new Request("http://test"), {
      params: Promise.resolve({ slug: ISOLATION_PROGRAM_SLUG }),
    });
    expect(response.status).toBe(404);
  });

  it("returns 404 JSON for anonymous access to internal program", async () => {
    mockContext(anonymous);
    const response = await getProgram(new Request("http://test"), {
      params: Promise.resolve({ slug: ISOLATION_PROGRAM_SLUG }),
    });
    expect(response.status).toBe(404);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  it("returns 404 JSON for anonymous access to internal program lesson", async () => {
    mockContext(anonymous);
    const response = await getLesson(new Request("http://test"), {
      params: Promise.resolve({
        slug: ISOLATION_PROGRAM_SLUG,
        lessonSlug: "draft-lesson",
      }),
    });
    expect(response.status).toBe(404);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBeTruthy();
  });

  it("returns 200 JSON for anonymous access to listed arcium lesson without answer keys", async () => {
    mockContext(anonymous);
    const response = await getLesson(new Request("http://test"), {
      params: Promise.resolve({ slug: "arcium", lessonSlug: "welcome" }),
    });
    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      lesson: { quiz?: { questions: Array<Record<string, unknown>> } };
    };
    expect(body.lesson.quiz?.questions[0]).not.toHaveProperty("correctAnswer");
  });
});
