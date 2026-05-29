import type { PoolClient } from "pg";
import { ConflictError, NotFoundError } from "@/lib/errors";
import { withTenantTransaction } from "@/lib/db";
import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { requireStaff } from "@/lib/tenant/require-staff";

const PLACEHOLDER_BLOCKS = [
  {
    type: "paragraph" as const,
    text: { en: "Draft — add content in the lesson editor." },
  },
];

export type StaffProgramListRow = {
  slug: string;
  title: string;
  hubStatus: string;
  draftStatus: string;
  lessonCount: number;
  updatedAt: Date;
};

export type StaffProgramOverview = {
  orgSlug: string;
  orgName: string;
  programSlug: string;
  title: string;
  tagline: string | null;
  hubStatus: string;
  draftStatus: string;
  activePublishedVersionId: string | null;
  lessonCount: number;
};

export type StaffLessonRow = {
  slug: string;
  title: string;
};

type ProgramRow = {
  program_id: string;
  program_slug: string;
  program_title: string;
  program_tagline: string | null;
  hub_status: string;
  draft_status: string;
  active_published_version_id: string | null;
  curriculum_id: string;
  org_slug: string;
  org_name: string;
};

function isUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

async function getProgramRow(
  client: PoolClient,
  orgSlug: string,
  programSlug: string,
): Promise<ProgramRow> {
  const { rows } = await client.query<{
    program_id: string;
    program_slug: string;
    program_title: string;
    program_tagline: string | null;
    hub_status: string;
    draft_status: string;
    active_published_version_id: string | null;
    curriculum_id: string;
    org_slug: string;
    org_name: string;
  }>(
    `select p.id as program_id,
            p.slug as program_slug,
            p.title as program_title,
            p.tagline as program_tagline,
            p.hub_status::text as hub_status,
            c.draft_status::text as draft_status,
            p.active_published_version_id,
            c.id as curriculum_id,
            o.slug as org_slug,
            o.name as org_name
     from program p
     join organization o on o.id = p.organization_id
     join curriculum c on c.program_id = p.id
     where o.slug = $1
       and p.slug = $2`,
    [orgSlug, programSlug],
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError();
  }

  return row;
}

async function countWorkspaceLessons(
  client: PoolClient,
  curriculumId: string,
  activePublishedVersionId: string | null,
): Promise<number> {
  const { rows } = await client.query<{ count: string }>(
    `select count(lv.id)::text as count
     from curriculum_version cv
     join track t on t.curriculum_version_id = cv.id
     join lesson_version lv on lv.track_id = t.id
     where cv.curriculum_id = $1
       and (
         $2::uuid is null
         or cv.id is distinct from $2::uuid
       )`,
    [curriculumId, activePublishedVersionId],
  );

  return Number(rows[0]?.count ?? 0);
}

async function getOrCreateWorkspaceVersionId(
  client: PoolClient,
  curriculumId: string,
  activePublishedVersionId: string | null,
): Promise<string> {
  const { rows } = await client.query<{ id: string }>(
    `select id
     from curriculum_version
     where curriculum_id = $1
       and (
         $2::uuid is null
         or id is distinct from $2::uuid
       )
     order by version_number desc
     limit 1`,
    [curriculumId, activePublishedVersionId],
  );

  if (rows[0]?.id) {
    return rows[0].id;
  }

  const inserted = await client.query<{ id: string }>(
    `insert into curriculum_version (curriculum_id, version_number, status)
     values ($1, 1, 'published')
     returning id`,
    [curriculumId],
  );

  return inserted.rows[0].id;
}

export async function listProgramsForOrg(
  ctx: TenantContext,
  orgSlug: string,
): Promise<StaffProgramListRow[]> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      slug: string;
      title: string;
      hub_status: string;
      draft_status: string;
      active_published_version_id: string | null;
      curriculum_id: string;
      updated_at: Date;
    }>(
      `select p.slug,
              p.title,
              p.hub_status::text as hub_status,
              c.draft_status::text as draft_status,
              p.active_published_version_id,
              c.id as curriculum_id,
              p.updated_at
       from program p
       join organization o on o.id = p.organization_id
       join curriculum c on c.program_id = p.id
       where o.slug = $1
       order by p.updated_at desc`,
      [orgSlug],
    );

    return Promise.all(
      rows.map(async (row) => ({
        slug: row.slug,
        title: row.title,
        hubStatus: row.hub_status,
        draftStatus: row.draft_status,
        lessonCount: await countWorkspaceLessons(
          client,
          row.curriculum_id,
          row.active_published_version_id,
        ),
        updatedAt: row.updated_at,
      })),
    );
  });
}

export async function createProgram(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    title: string;
    slug: string;
    tagline: string | null;
  },
): Promise<{ orgSlug: string; programSlug: string }> {
  requireStaff(ctx);

  try {
    return await withTenantTransaction(toTenantSession(ctx), async (client) => {
      const { rows: orgRows } = await client.query<{ id: string }>(
        `select id from organization where slug = $1`,
        [input.orgSlug],
      );

      const org = orgRows[0];
      if (!org) {
        throw new NotFoundError();
      }

      const { rows: programRows } = await client.query<{ id: string; slug: string }>(
        `insert into program (organization_id, slug, title, tagline, hub_status)
         values ($1, $2, $3, $4, 'internal')
         returning id, slug`,
        [org.id, input.slug, input.title, input.tagline],
      );

      await client.query(
        `insert into curriculum (program_id, draft_status)
         values ($1, 'draft')`,
        [programRows[0].id],
      );

      return { orgSlug: input.orgSlug, programSlug: programRows[0].slug };
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("Program slug already exists for this organization.");
    }
    throw error;
  }
}

export async function getStaffProgramOverview(
  ctx: TenantContext,
  input: { orgSlug: string; programSlug: string },
): Promise<StaffProgramOverview> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const row = await getProgramRow(client, input.orgSlug, input.programSlug);
    const lessonCount = await countWorkspaceLessons(
      client,
      row.curriculum_id,
      row.active_published_version_id,
    );

    return {
      orgSlug: row.org_slug,
      orgName: row.org_name,
      programSlug: row.program_slug,
      title: row.program_title,
      tagline: row.program_tagline,
      hubStatus: row.hub_status,
      draftStatus: row.draft_status,
      activePublishedVersionId: row.active_published_version_id,
      lessonCount,
    };
  });
}

export async function updateProgramDetails(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    programSlug: string;
    title: string;
    tagline: string | null;
  },
): Promise<void> {
  requireStaff(ctx);

  await withTenantTransaction(toTenantSession(ctx), async (client) => {
    const row = await getProgramRow(client, input.orgSlug, input.programSlug);

    const { rowCount } = await client.query(
      `update program
       set title = $2,
           tagline = $3,
           updated_at = now()
       where id = $1`,
      [row.program_id, input.title, input.tagline],
    );

    if (!rowCount) {
      throw new NotFoundError();
    }
  });
}

export async function listWorkspaceLessons(
  ctx: TenantContext,
  input: { orgSlug: string; programSlug: string },
): Promise<StaffLessonRow[]> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const row = await getProgramRow(client, input.orgSlug, input.programSlug);
    const workspaceVersionId = await getOrCreateWorkspaceVersionId(
      client,
      row.curriculum_id,
      row.active_published_version_id,
    );

    const { rows } = await client.query<{
      slug: string;
      title: Record<string, string>;
    }>(
      `select lv.slug, lv.title
       from track t
       join lesson_version lv on lv.track_id = t.id
       where t.curriculum_version_id = $1
       order by t.position asc, lv.position asc`,
      [workspaceVersionId],
    );

    return rows.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title.en ?? Object.values(lesson.title)[0] ?? lesson.slug,
    }));
  });
}

export async function createFirstDraftLesson(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    programSlug: string;
    title: string;
    slug: string;
  },
): Promise<void> {
  requireStaff(ctx);

  try {
    await withTenantTransaction(toTenantSession(ctx), async (client) => {
      const row = await getProgramRow(client, input.orgSlug, input.programSlug);
      const workspaceVersionId = await getOrCreateWorkspaceVersionId(
        client,
        row.curriculum_id,
        row.active_published_version_id,
      );

      let trackId = (
        await client.query<{ id: string }>(
          `select id from track
           where curriculum_version_id = $1
           order by position asc
           limit 1`,
          [workspaceVersionId],
        )
      ).rows[0]?.id;

      if (!trackId) {
        trackId = (
          await client.query<{ id: string }>(
            `insert into track (curriculum_version_id, position, slug, title)
             values ($1, 1, 'main', '{"en":"Main track"}'::jsonb)
             returning id`,
            [workspaceVersionId],
          )
        ).rows[0].id;
      }

      const positionRows = await client.query<{ next_position: string }>(
        `select coalesce(max(position), 0) + 1 as next_position
         from lesson_version
         where track_id = $1`,
        [trackId],
      );

      await client.query(
        `insert into lesson_version (track_id, position, slug, title, blocks)
         values ($1, $2, $3, $4::jsonb, $5::jsonb)`,
        [
          trackId,
          Number(positionRows.rows[0].next_position),
          input.slug,
          JSON.stringify({ en: input.title }),
          JSON.stringify(PLACEHOLDER_BLOCKS),
        ],
      );

      await client.query(`update program set updated_at = now() where id = $1`, [
        row.program_id,
      ]);
    });
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("Lesson slug already exists in this program.");
    }
    throw error;
  }
}
