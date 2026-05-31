import type { PoolClient } from "pg";
import type { ContentBlock } from "@/lib/content-blocks/schema";
import { parseLessonBlocks } from "@/lib/content-blocks/schema";
import { AppError, ConflictError, NotFoundError } from "@/lib/errors";
import { isAllowedCloudinaryUrl } from "@/lib/media/cloudinary-url";
import type { QuizQuestion, ScoringConfig } from "@/lib/quiz/schema";
import { parseQuizQuestions, parseScoringConfig } from "@/lib/quiz/schema";
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
  position: number;
};

export type StaffWorkspaceLesson = StaffLessonRow & {
  id: string;
};

export type StaffWorkspaceLessonContent = StaffWorkspaceLesson & {
  blocks: ContentBlock[];
  quiz: {
    questions: QuizQuestion[];
    scoringConfig: ScoringConfig;
  } | null;
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

async function findWorkspaceVersionId(
  client: PoolClient,
  curriculumId: string,
  activePublishedVersionId: string | null,
): Promise<string | null> {
  const { rows } = await client.query<{ id: string }>(
    `select id
     from curriculum_version
     where curriculum_id = $1
       and (
         $2::uuid is not null
         and id is distinct from $2::uuid
       )
     order by version_number desc
     limit 1`,
    [curriculumId, activePublishedVersionId],
  );

  if (rows[0]?.id) {
    return rows[0].id;
  }

  if (activePublishedVersionId !== null) {
    return null;
  }

  const { rows: latestRows } = await client.query<{ id: string }>(
    `select id
     from curriculum_version
     where curriculum_id = $1
     order by version_number desc
     limit 1`,
    [curriculumId],
  );

  return latestRows[0]?.id ?? null;
}

async function countWorkspaceLessons(
  client: PoolClient,
  curriculumId: string,
  activePublishedVersionId: string | null,
): Promise<number> {
  const workspaceVersionId = await findWorkspaceVersionId(
    client,
    curriculumId,
    activePublishedVersionId,
  );

  if (!workspaceVersionId) {
    return 0;
  }

  const { rows } = await client.query<{ count: string }>(
    `select count(lv.id)::text as count
     from track t
     join lesson_version lv on lv.track_id = t.id
     where t.curriculum_version_id = $1`,
    [workspaceVersionId],
  );

  return Number(rows[0]?.count ?? 0);
}

async function getOrCreateWorkspaceVersionId(
  client: PoolClient,
  curriculumId: string,
  activePublishedVersionId: string | null,
): Promise<string> {
  const existing = await findWorkspaceVersionId(
    client,
    curriculumId,
    activePublishedVersionId,
  );

  if (existing) {
    return existing;
  }

  const { rows: nextRows } = await client.query<{ next_version: string }>(
    `select coalesce(max(version_number), 0) + 1 as next_version
     from curriculum_version
     where curriculum_id = $1`,
    [curriculumId],
  );

  const inserted = await client.query<{ id: string }>(
    `insert into curriculum_version (curriculum_id, version_number, status)
     values ($1, $2, 'published')
     returning id`,
    [curriculumId, Number(nextRows[0].next_version)],
  );

  return inserted.rows[0].id;
}

async function getWorkspaceContext(
  client: PoolClient,
  orgSlug: string,
  programSlug: string,
) {
  const row = await getProgramRow(client, orgSlug, programSlug);
  const workspaceVersionId = await findWorkspaceVersionId(
    client,
    row.curriculum_id,
    row.active_published_version_id,
  );

  if (!workspaceVersionId) {
    return { row, workspaceVersionId: null, trackId: null };
  }

  const trackRow = (
    await client.query<{ id: string }>(
      `select id from track
       where curriculum_version_id = $1
       order by position asc
       limit 1`,
      [workspaceVersionId],
    )
  ).rows[0];

  return {
    row,
    workspaceVersionId,
    trackId: trackRow?.id ?? null,
  };
}

async function listWorkspaceLessonsInTrack(
  client: PoolClient,
  trackId: string,
): Promise<StaffLessonRow[]> {
  const { rows } = await client.query<{
    slug: string;
    title: Record<string, string>;
    position: number;
  }>(
    `select lv.slug, lv.title, lv.position
     from lesson_version lv
     where lv.track_id = $1
     order by lv.position asc`,
    [trackId],
  );

  return rows.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title.en ?? Object.values(lesson.title)[0] ?? lesson.slug,
    position: lesson.position,
  }));
}

function assertAllowedBlockMedia(blocks: ContentBlock[]) {
  for (const block of blocks) {
    if (block.type === "image" && !isAllowedCloudinaryUrl(block.cloudinary_url)) {
      throw new AppError("Image URL must be from the configured Cloudinary account.", 400);
    }
  }
}

function assertAllowedQuizMedia(questions: QuizQuestion[]) {
  for (const question of questions) {
    if (
      question.image &&
      !isAllowedCloudinaryUrl(question.image.cloudinary_url)
    ) {
      throw new AppError("Quiz image URL must be from the configured Cloudinary account.", 400);
    }
  }
}

async function getWorkspaceLessonRow(
  client: PoolClient,
  trackId: string,
  lessonSlug: string,
) {
  const { rows } = await client.query<{
    id: string;
    slug: string;
    title: Record<string, string>;
    position: number;
    blocks: unknown;
    quiz_version_id: string | null;
    questions: unknown | null;
    scoring_config: unknown | null;
  }>(
    `select lv.id,
            lv.slug,
            lv.title,
            lv.position,
            lv.blocks,
            lv.quiz_version_id,
            qv.questions,
            qv.scoring_config
     from lesson_version lv
     left join quiz_version qv on qv.id = lv.quiz_version_id
     where lv.track_id = $1
       and lv.slug = $2
     limit 1`,
    [trackId, lessonSlug],
  );

  const lesson = rows[0];
  if (!lesson) {
    throw new NotFoundError();
  }

  return lesson;
}

function mapWorkspaceLessonContent(
  lesson: Awaited<ReturnType<typeof getWorkspaceLessonRow>>,
): StaffWorkspaceLessonContent {
  const blocks = parseLessonBlocks(lesson.blocks);
  if (!blocks.success) {
    throw new AppError("Stored lesson blocks are invalid.", 500);
  }

  let quiz: StaffWorkspaceLessonContent["quiz"] = null;
  if (lesson.quiz_version_id && lesson.questions && lesson.scoring_config) {
    const questions = parseQuizQuestions(lesson.questions);
    const scoringConfig = parseScoringConfig(lesson.scoring_config);
    if (questions.success && scoringConfig.success) {
      quiz = {
        questions: questions.data,
        scoringConfig: scoringConfig.data,
      };
    }
  }

  return {
    id: lesson.id,
    slug: lesson.slug,
    title: lesson.title.en ?? Object.values(lesson.title)[0] ?? lesson.slug,
    position: lesson.position,
    blocks: blocks.data,
    quiz,
  };
}

async function compactLessonPositions(client: PoolClient, trackId: string) {
  await client.query(
    `with ordered as (
       select id, row_number() over (order by position asc)::int as new_position
       from lesson_version
       where track_id = $1
     )
     update lesson_version lv
     set position = ordered.new_position
     from ordered
     where lv.id = ordered.id`,
    [trackId],
  );
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
    const workspaceVersionId = await findWorkspaceVersionId(
      client,
      row.curriculum_id,
      row.active_published_version_id,
    );

    if (!workspaceVersionId) {
      return [];
    }

    const { rows } = await client.query<{
      slug: string;
      title: Record<string, string>;
      position: number;
    }>(
      `select lv.slug, lv.title, lv.position
       from track t
       join lesson_version lv on lv.track_id = t.id
       where t.curriculum_version_id = $1
       order by t.position asc, lv.position asc`,
      [workspaceVersionId],
    );

    return rows.map((lesson) => ({
      slug: lesson.slug,
      title: lesson.title.en ?? Object.values(lesson.title)[0] ?? lesson.slug,
      position: lesson.position,
    }));
  });
}

export async function createDraftLesson(
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

      const existingLesson = await client.query<{ id: string }>(
        `select lv.id
         from lesson_version lv
         where lv.track_id = $1
           and lv.slug = $2
         limit 1`,
        [trackId, input.slug],
      );

      if (existingLesson.rows[0]) {
        throw new ConflictError(
          "A lesson with this slug already exists in the draft curriculum.",
        );
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
    if (error instanceof ConflictError) {
      throw error;
    }
    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "Could not create lesson — slug may already be in use in this draft.",
      );
    }
    throw error;
  }
}

/** @deprecated Use createDraftLesson */
export const createFirstDraftLesson = createDraftLesson;

export async function getWorkspaceLesson(
  ctx: TenantContext,
  input: { orgSlug: string; programSlug: string; lessonSlug: string },
): Promise<StaffWorkspaceLesson> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const { rows } = await client.query<{
      id: string;
      slug: string;
      title: Record<string, string>;
      position: number;
    }>(
      `select lv.id, lv.slug, lv.title, lv.position
       from lesson_version lv
       where lv.track_id = $1
         and lv.slug = $2
       limit 1`,
      [trackId, input.lessonSlug],
    );

    const lesson = rows[0];
    if (!lesson) {
      throw new NotFoundError();
    }

    return {
      id: lesson.id,
      slug: lesson.slug,
      title: lesson.title.en ?? Object.values(lesson.title)[0] ?? lesson.slug,
      position: lesson.position,
    };
  });
}

export async function updateDraftLessonMetadata(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    programSlug: string;
    lessonSlug: string;
    title: string;
    slug: string;
  },
): Promise<{ slug: string }> {
  requireStaff(ctx);

  try {
    return await withTenantTransaction(toTenantSession(ctx), async (client) => {
      const { row, trackId } = await getWorkspaceContext(
        client,
        input.orgSlug,
        input.programSlug,
      );

      if (!trackId) {
        throw new NotFoundError();
      }

      const current = (
        await client.query<{ id: string }>(
          `select id from lesson_version
           where track_id = $1 and slug = $2
           limit 1`,
          [trackId, input.lessonSlug],
        )
      ).rows[0];

      if (!current) {
        throw new NotFoundError();
      }

      if (input.slug !== input.lessonSlug) {
        const conflict = (
          await client.query<{ id: string }>(
            `select id from lesson_version
             where track_id = $1 and slug = $2 and id <> $3
             limit 1`,
            [trackId, input.slug, current.id],
          )
        ).rows[0];

        if (conflict) {
          throw new ConflictError(
            "A lesson with this slug already exists in the draft curriculum.",
          );
        }
      }

      await client.query(
        `update lesson_version
         set slug = $2,
             title = $3::jsonb
         where id = $1`,
        [current.id, input.slug, JSON.stringify({ en: input.title })],
      );

      await client.query(`update program set updated_at = now() where id = $1`, [
        row.program_id,
      ]);

      return { slug: input.slug };
    });
  } catch (error) {
    if (error instanceof ConflictError || error instanceof NotFoundError) {
      throw error;
    }
    if (isUniqueViolation(error)) {
      throw new ConflictError(
        "Could not update lesson — slug may already be in use in this draft.",
      );
    }
    throw error;
  }
}

export async function reorderDraftLesson(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    programSlug: string;
    lessonSlug: string;
    direction: "up" | "down";
  },
): Promise<void> {
  requireStaff(ctx);

  await withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { row, trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const lessons = await listWorkspaceLessonsInTrack(client, trackId);
    const index = lessons.findIndex((lesson) => lesson.slug === input.lessonSlug);

    if (index === -1) {
      throw new NotFoundError();
    }

    const swapIndex = input.direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= lessons.length) {
      return;
    }

    const current = lessons[index];
    const adjacent = lessons[swapIndex];

    const ids = await client.query<{ id: string; slug: string }>(
      `select id, slug from lesson_version
       where track_id = $1 and slug = any($2::text[])`,
      [trackId, [current.slug, adjacent.slug]],
    );

    const currentId = ids.rows.find((r) => r.slug === current.slug)?.id;
    const adjacentId = ids.rows.find((r) => r.slug === adjacent.slug)?.id;

    if (!currentId || !adjacentId) {
      throw new NotFoundError();
    }

    await client.query(`update lesson_version set position = -1 where id = $1`, [
      currentId,
    ]);
    await client.query(
      `update lesson_version set position = $1 where id = $2`,
      [current.position, adjacentId],
    );
    await client.query(
      `update lesson_version set position = $1 where id = $2`,
      [adjacent.position, currentId],
    );

    await client.query(`update program set updated_at = now() where id = $1`, [
      row.program_id,
    ]);
  });
}

export async function getWorkspaceLessonContent(
  ctx: TenantContext,
  input: { orgSlug: string; programSlug: string; lessonSlug: string },
): Promise<StaffWorkspaceLessonContent> {
  requireStaff(ctx);

  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const lesson = await getWorkspaceLessonRow(client, trackId, input.lessonSlug);
    return mapWorkspaceLessonContent(lesson);
  });
}

export async function updateDraftLessonBlocks(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    programSlug: string;
    lessonSlug: string;
    blocks: ContentBlock[];
  },
): Promise<void> {
  requireStaff(ctx);

  assertAllowedBlockMedia(input.blocks);

  await withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { row, trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const lesson = await getWorkspaceLessonRow(client, trackId, input.lessonSlug);

    const { rowCount } = await client.query(
      `update lesson_version
       set blocks = $2::jsonb
       where id = $1`,
      [lesson.id, JSON.stringify(input.blocks)],
    );

    if (!rowCount) {
      throw new NotFoundError();
    }

    await client.query(`update program set updated_at = now() where id = $1`, [
      row.program_id,
    ]);
  });
}

export async function upsertDraftLessonQuiz(
  ctx: TenantContext,
  input: {
    orgSlug: string;
    programSlug: string;
    lessonSlug: string;
    questions: QuizQuestion[];
    scoringConfig: ScoringConfig;
  },
): Promise<void> {
  requireStaff(ctx);

  assertAllowedQuizMedia(input.questions);

  await withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { row, trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const lesson = await getWorkspaceLessonRow(client, trackId, input.lessonSlug);

    if (lesson.quiz_version_id) {
      const { rowCount } = await client.query(
        `update quiz_version
         set questions = $2::jsonb,
             scoring_config = $3::jsonb
         where id = $1`,
        [
          lesson.quiz_version_id,
          JSON.stringify(input.questions),
          JSON.stringify(input.scoringConfig),
        ],
      );

      if (!rowCount) {
        throw new NotFoundError();
      }
    } else {
      const inserted = await client.query<{ id: string }>(
        `insert into quiz_version (questions, scoring_config)
         values ($1::jsonb, $2::jsonb)
         returning id`,
        [
          JSON.stringify(input.questions),
          JSON.stringify(input.scoringConfig),
        ],
      );

      const quizVersionId = inserted.rows[0]?.id;
      if (!quizVersionId) {
        throw new AppError("Could not create quiz version.", 500);
      }

      await client.query(
        `update lesson_version
         set quiz_version_id = $2
         where id = $1`,
        [lesson.id, quizVersionId],
      );
    }

    await client.query(`update program set updated_at = now() where id = $1`, [
      row.program_id,
    ]);
  });
}

export async function clearDraftLessonQuiz(
  ctx: TenantContext,
  input: { orgSlug: string; programSlug: string; lessonSlug: string },
): Promise<void> {
  requireStaff(ctx);

  await withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { row, trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const lesson = await getWorkspaceLessonRow(client, trackId, input.lessonSlug);

    if (!lesson.quiz_version_id) {
      return;
    }

    await client.query(
      `update lesson_version
       set quiz_version_id = null
       where id = $1`,
      [lesson.id],
    );

    await client.query(`update program set updated_at = now() where id = $1`, [
      row.program_id,
    ]);
  });
}

export async function deleteDraftLesson(
  ctx: TenantContext,
  input: { orgSlug: string; programSlug: string; lessonSlug: string },
): Promise<void> {
  requireStaff(ctx);

  await withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { row, trackId } = await getWorkspaceContext(
      client,
      input.orgSlug,
      input.programSlug,
    );

    if (!trackId) {
      throw new NotFoundError();
    }

    const lessons = await listWorkspaceLessonsInTrack(client, trackId);
    if (lessons.length <= 1) {
      throw new AppError("Programs must keep at least one draft lesson.", 400);
    }

    const target = lessons.find((lesson) => lesson.slug === input.lessonSlug);
    if (!target) {
      throw new NotFoundError();
    }

    const { rowCount } = await client.query(
      `delete from lesson_version lv
       using track t
       where lv.track_id = t.id
         and t.id = $1
         and lv.slug = $2`,
      [trackId, input.lessonSlug],
    );

    if (!rowCount) {
      throw new NotFoundError();
    }

    await compactLessonPositions(client, trackId);
    await client.query(`update program set updated_at = now() where id = $1`, [
      row.program_id,
    ]);
  });
}
