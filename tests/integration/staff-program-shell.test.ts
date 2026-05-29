import { beforeAll, describe, expect, it } from "vitest";
import { config } from "dotenv";
import path from "node:path";
import pg from "pg";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { listListedPrograms } from "@/lib/tenant/repositories/programs";
import {
  createFirstDraftLesson,
  createProgram,
  getStaffProgramOverview,
} from "@/lib/tenant/repositories/staff-programs";
import { ConflictError } from "@/lib/errors";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

export const STAFF_TEST_ORG_SLUG = "staff-test-org";

const staffCtx = {
  kind: "staff" as const,
  userId: "staff-user",
  orgIds: [] as string[],
  isStaff: true as const,
};

const anonymous = { kind: "anonymous" as const, isStaff: false as const };

async function ensureStaffTestOrg() {
  const client = new pg.Client({ connectionString });
  await client.connect();
  try {
    await client.query("begin");
    await client.query(
      `SELECT set_config('app.is_staff', 'true', true),
              set_config('app.current_user_id', '', true),
              set_config('app.current_org_ids', '', true)`,
    );
    await client.query(
      `insert into organization (slug, name, trust_level)
       values ($1, 'Staff Test Org', 'untrusted')
       on conflict (slug) do nothing`,
      [STAFF_TEST_ORG_SLUG],
    );
    await client.query("commit");
  } catch (error) {
    await client.query("rollback");
    throw error;
  } finally {
    await client.end();
  }
}

describe("staff program shell", () => {
  beforeAll(async () => {
    if (!connectionString) {
      throw new Error("DATABASE_URL_UNPOOLED is required for integration tests");
    }
    process.env.STAFF_USER_IDS = "staff-user";
    await ensureStaffTestOrg();
  });

  it("staff creates program with curriculum draft row", async () => {
    const slug = `staff-shell-${Date.now()}`;
    const created = await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Staff Shell Test",
      slug,
      tagline: "Integration test program",
    });

    const overview = await getStaffProgramOverview(staffCtx, {
      orgSlug: created.orgSlug,
      programSlug: created.programSlug,
    });

    expect(overview.hubStatus).toBe("internal");
    expect(overview.draftStatus).toBe("draft");
    expect(overview.activePublishedVersionId).toBeNull();
    expect(overview.lessonCount).toBe(0);
  });

  it("duplicate program slug returns conflict", async () => {
    const slug = `dup-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Dup Test",
      slug,
      tagline: null,
    });

    await expect(
      createProgram(staffCtx, {
        orgSlug: STAFF_TEST_ORG_SLUG,
        title: "Dup Test 2",
        slug,
        tagline: null,
      }),
    ).rejects.toBeInstanceOf(ConflictError);
  });

  it("staff can create first draft lesson in workspace", async () => {
    const slug = `lesson-${Date.now()}`;
    const created = await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Lesson Test Program",
      slug,
      tagline: null,
    });

    await createFirstDraftLesson(staffCtx, {
      orgSlug: created.orgSlug,
      programSlug: created.programSlug,
      title: "Getting started",
      slug: "getting-started",
    });

    const overview = await getStaffProgramOverview(staffCtx, {
      orgSlug: created.orgSlug,
      programSlug: created.programSlug,
    });

    expect(overview.lessonCount).toBe(1);
    expect(overview.activePublishedVersionId).toBeNull();
  });

  it("internal program is not in public catalog", async () => {
    const slug = `internal-${Date.now()}`;
    await createProgram(staffCtx, {
      orgSlug: STAFF_TEST_ORG_SLUG,
      title: "Internal Only",
      slug,
      tagline: null,
    });

    const listed = await listListedPrograms(anonymous);
    expect(listed.some((program) => program.slug === slug)).toBe(false);
  });
});
