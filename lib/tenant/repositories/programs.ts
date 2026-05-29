import type { PoolClient } from "pg";
import type { ContentBlock } from "@/lib/content-blocks/schema";
import { NotFoundError } from "@/lib/errors";
import {
  blurbFromBlocks,
  estimateProgramHours,
  localeText,
  readingMinutesFromBlocks,
  toHubQuizView,
} from "@/lib/hub/content-utils";
import type {
  HubLessonDetail,
  HubProgramDetail,
  HubProgramSummary,
} from "@/lib/hub/types";
import { toPublicQuiz } from "@/lib/quiz/public";
import {
  parseQuizQuestions,
  parseScoringConfig,
  type QuizQuestion,
} from "@/lib/quiz/schema";
import { parseLessonBlocks } from "@/lib/content-blocks/schema";
import { toTenantSession, type TenantContext } from "@/lib/tenant/context";
import { withTenantTransaction } from "@/lib/db";

export type ProgramCatalogRow = {
  slug: string;
  title: string;
  tagline: string | null;
  hubStatus: "listed" | "featured";
  featuredRank: number | null;
};

export type PublishedLessonRow = {
  slug: string;
  title: Record<string, string>;
  blocks: ContentBlock[];
  quiz: ReturnType<typeof toPublicQuiz> | null;
};

export async function listListedPrograms(
  ctx: TenantContext,
): Promise<ProgramCatalogRow[]> {
  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      slug: string;
      title: string;
      tagline: string | null;
      hub_status: "listed" | "featured";
      featured_rank: number | null;
    }>(
      `select slug, title, tagline, hub_status, featured_rank
       from program
       where hub_status in ('listed', 'featured')
         and active_published_version_id is not null
       order by featured_rank nulls last, title asc`,
    );

    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      tagline: row.tagline,
      hubStatus: row.hub_status,
      featuredRank: row.featured_rank,
    }));
  });
}

export async function getProgramBySlug(
  ctx: TenantContext,
  programSlug: string,
): Promise<ProgramCatalogRow> {
  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      slug: string;
      title: string;
      tagline: string | null;
      hub_status: "listed" | "featured" | "internal" | "sunset" | "archived";
      featured_rank: number | null;
      organization_id: string;
    }>(
      `select slug, title, tagline, hub_status, featured_rank, organization_id
       from program
       where slug = $1`,
      [programSlug],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundError();
    }

    const isPublicListed =
      row.hub_status === "listed" || row.hub_status === "featured";

    if (!isPublicListed) {
      const hasOrgAccess =
        (ctx.kind === "learner" || ctx.kind === "partner") &&
        ctx.orgIds.includes(row.organization_id);

      if (
        ctx.kind !== "staff" &&
        ctx.kind !== "system" &&
        !hasOrgAccess
      ) {
        throw new NotFoundError();
      }
    }

    return {
      slug: row.slug,
      title: row.title,
      tagline: row.tagline,
      hubStatus:
        row.hub_status === "listed" || row.hub_status === "featured"
          ? row.hub_status
          : "listed",
      featuredRank: row.featured_rank,
    };
  });
}

export async function listHubProgramSummaries(
  ctx: TenantContext,
): Promise<HubProgramSummary[]> {
  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      slug: string;
      title: string;
      tagline: string | null;
      hub_status: "listed" | "featured";
      featured_rank: number | null;
      org_name: string;
      track_count: string;
      lesson_count: string;
    }>(
      `select p.slug,
              p.title,
              p.tagline,
              p.hub_status,
              p.featured_rank,
              o.name as org_name,
              count(distinct t.id)::text as track_count,
              count(lv.id)::text as lesson_count
       from program p
       join organization o on o.id = p.organization_id
       join curriculum_version cv on cv.id = p.active_published_version_id
       left join track t on t.curriculum_version_id = cv.id
       left join lesson_version lv on lv.track_id = t.id
       where p.hub_status in ('listed', 'featured')
         and p.active_published_version_id is not null
       group by p.id, o.name
       order by p.featured_rank nulls last, p.title asc`,
    );

    return rows.map((row) => {
      const lessonCount = Number(row.lesson_count);
      const trackCount = Number(row.track_count);

      return {
        slug: row.slug,
        title: row.title,
        tagline: row.tagline ?? "",
        org: row.org_name,
        hubStatus: row.hub_status,
        featuredRank: row.featured_rank,
        lessonCount,
        trackCount,
        estimatedHours: estimateProgramHours(lessonCount),
      };
    });
  });
}

async function assertProgramReadable(
  ctx: TenantContext,
  programSlug: string,
  client: PoolClient,
): Promise<{
  slug: string;
  title: string;
  tagline: string | null;
  hub_status: string;
  featured_rank: number | null;
  organization_id: string;
  org_name: string;
  active_published_version_id: string | null;
}> {
  const { rows } = await client.query<{
    slug: string;
    title: string;
    tagline: string | null;
    hub_status: string;
    featured_rank: number | null;
    organization_id: string;
    org_name: string;
    active_published_version_id: string | null;
  }>(
    `select p.slug,
            p.title,
            p.tagline,
            p.hub_status::text as hub_status,
            p.featured_rank,
            p.organization_id,
            o.name as org_name,
            p.active_published_version_id
     from program p
     join organization o on o.id = p.organization_id
     where p.slug = $1`,
    [programSlug],
  );

  const row = rows[0];
  if (!row) {
    throw new NotFoundError();
  }

  const isPublicListed =
    row.hub_status === "listed" || row.hub_status === "featured";

  if (!isPublicListed) {
    const hasOrgAccess =
      (ctx.kind === "learner" || ctx.kind === "partner") &&
      ctx.orgIds.includes(row.organization_id);

    if (ctx.kind !== "staff" && ctx.kind !== "system" && !hasOrgAccess) {
      throw new NotFoundError();
    }
  }

  return row;
}

export async function getHubProgramDetail(
  ctx: TenantContext,
  programSlug: string,
): Promise<HubProgramDetail> {
  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const program = await assertProgramReadable(ctx, programSlug, client);

    if (!program.active_published_version_id) {
      return {
        slug: program.slug,
        title: program.title,
        tagline: program.tagline ?? "",
        org: program.org_name,
        hubStatus:
          program.hub_status === "featured" ? "featured" : "listed",
        featuredRank: program.featured_rank,
        lessonCount: 0,
        trackCount: 0,
        estimatedHours: 0,
        tracks: [],
      };
    }

    const { rows } = await client.query<{
      track_slug: string;
      track_title: Record<string, string>;
      track_position: number;
      lesson_slug: string;
      lesson_title: Record<string, string>;
      lesson_position: number;
      blocks: unknown;
      has_quiz: boolean;
    }>(
      `select t.slug as track_slug,
              t.title as track_title,
              t.position as track_position,
              lv.slug as lesson_slug,
              lv.title as lesson_title,
              lv.position as lesson_position,
              lv.blocks,
              (lv.quiz_version_id is not null) as has_quiz
       from track t
       join lesson_version lv on lv.track_id = t.id
       where t.curriculum_version_id = $1
       order by t.position asc, lv.position asc`,
      [program.active_published_version_id],
    );

    const tracks = new Map<
      string,
      {
        slug: string;
        title: string;
        description: string;
        lessons: HubProgramDetail["tracks"][number]["lessons"];
      }
    >();

    for (const row of rows) {
      let track = tracks.get(row.track_slug);
      if (!track) {
        track = {
          slug: row.track_slug,
          title: localeText(row.track_title),
          description: "",
          lessons: [],
        };
        tracks.set(row.track_slug, track);
      }

      const blocks = parseLessonBlocks(row.blocks);
      const parsedBlocks = blocks.success ? blocks.data : [];

      track.lessons.push({
        slug: row.lesson_slug,
        title: localeText(row.lesson_title),
        blurb: blurbFromBlocks(parsedBlocks),
        readingMinutes: readingMinutesFromBlocks(parsedBlocks),
        hasQuiz: row.has_quiz,
      });
    }

    const trackList = [...tracks.values()];
    const lessonCount = trackList.reduce(
      (count, track) => count + track.lessons.length,
      0,
    );

    return {
      slug: program.slug,
      title: program.title,
      tagline: program.tagline ?? "",
      org: program.org_name,
      hubStatus:
        program.hub_status === "featured" ? "featured" : "listed",
      featuredRank: program.featured_rank,
      lessonCount,
      trackCount: trackList.length,
      estimatedHours: estimateProgramHours(lessonCount),
      tracks: trackList,
    };
  });
}

export async function getHubLessonDetail(
  ctx: TenantContext,
  input: { programSlug: string; lessonSlug: string },
): Promise<HubLessonDetail> {
  const program = await getHubProgramDetail(ctx, input.programSlug);
  const lesson = await getPublishedLessonVersion(ctx, input);

  const flat = program.tracks.flatMap((track) =>
    track.lessons.map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      trackTitle: track.title,
    })),
  );

  const index = flat.findIndex((entry) => entry.slug === input.lessonSlug);
  const track =
    program.tracks.find((candidate) =>
      candidate.lessons.some((entry) => entry.slug === input.lessonSlug),
    ) ?? null;

  return {
    slug: lesson.slug,
    programSlug: program.slug,
    programTitle: program.title,
    trackSlug: track?.slug ?? "",
    trackTitle: track?.title ?? "",
    title: localeText(lesson.title),
    blurb:
      track?.lessons.find((entry) => entry.slug === input.lessonSlug)?.blurb ??
      blurbFromBlocks(lesson.blocks),
    readingMinutes:
      track?.lessons.find((entry) => entry.slug === input.lessonSlug)
        ?.readingMinutes ?? readingMinutesFromBlocks(lesson.blocks),
    blocks: lesson.blocks,
    quiz: lesson.quiz ? toHubQuizView(lesson.quiz) : null,
    navigation: {
      flat,
      index,
    },
  };
}

export async function getPublishedLessonVersion(
  ctx: TenantContext,
  input: { programSlug: string; lessonSlug: string },
): Promise<PublishedLessonRow> {
  return withTenantTransaction(toTenantSession(ctx), async (client) => {
    const { rows } = await client.query<{
      lesson_slug: string;
      title: Record<string, string>;
      blocks: unknown;
      questions: unknown | null;
      scoring_config: unknown | null;
      hub_status: string;
    }>(
      `select lv.slug as lesson_slug,
              lv.title,
              lv.blocks,
              qv.questions,
              qv.scoring_config,
              p.hub_status::text as hub_status
       from program p
       join curriculum_version cv on cv.id = p.active_published_version_id
       join track t on t.curriculum_version_id = cv.id
       join lesson_version lv on lv.track_id = t.id
       left join quiz_version qv on qv.id = lv.quiz_version_id
       where p.slug = $1
         and lv.slug = $2`,
      [input.programSlug, input.lessonSlug],
    );

    const row = rows[0];
    if (!row) {
      throw new NotFoundError();
    }

    if (
      ctx.kind === "anonymous" &&
      row.hub_status !== "listed" &&
      row.hub_status !== "featured"
    ) {
      throw new NotFoundError();
    }

    const blocks = parseLessonBlocks(row.blocks);
    if (!blocks.success) {
      throw new NotFoundError("Invalid lesson content");
    }

    let quiz: ReturnType<typeof toPublicQuiz> | null = null;
    if (row.questions && row.scoring_config) {
      const questions = parseQuizQuestions(row.questions);
      const scoringConfig = parseScoringConfig(row.scoring_config);
      if (questions.success && scoringConfig.success) {
        quiz = toPublicQuiz({
          questions: questions.data as QuizQuestion[],
          scoringConfig: scoringConfig.data,
        });
      }
    }

    return {
      slug: row.lesson_slug,
      title: row.title,
      blocks: blocks.data,
      quiz,
    };
  });
}
