import type { ContentBlock } from "@/lib/content-blocks/schema";
import { ForbiddenError, NotFoundError } from "@/lib/errors";
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
