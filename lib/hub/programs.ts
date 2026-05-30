import {
  findLesson,
  getProgramBySlug as getPreviewProgramBySlug,
  listPrograms as listPreviewPrograms,
  PREVIEW_MODE,
  type PreviewLesson,
  type PreviewProgram,
} from "@/lib/preview-data";
import { NotFoundError } from "@/lib/errors";
import {
  estimateProgramHours,
  localeText,
  toHubQuizView,
} from "@/lib/hub/content-utils";
import type {
  HubLessonDetail,
  HubProgramDetail,
  HubProgramSummary,
  HubQuizView,
} from "@/lib/hub/types";
import { resolveTenantContext } from "@/lib/tenant/context";
import {
  getHubLessonDetail,
  getHubProgramDetail,
  listHubProgramSummaries,
} from "@/lib/tenant/repositories/programs";

function previewToSummary(program: PreviewProgram): HubProgramSummary {
  return {
    slug: program.slug,
    title: program.title,
    tagline: program.tagline,
    org: program.org,
    hubStatus: program.hubStatus,
    featuredRank: program.featuredRank,
    lessonCount: program.lessonCount,
    trackCount: program.trackCount,
    estimatedHours: program.estimatedHours,
  };
}

function previewToDetail(program: PreviewProgram): HubProgramDetail {
  return {
    ...previewToSummary(program),
    tracks: program.tracks.map((track) => ({
      slug: track.slug,
      title: track.title,
      description: track.description,
      lessons: track.lessons.map((lesson) => ({
        slug: lesson.slug,
        title: lesson.title,
        blurb: lesson.blurb,
        readingMinutes: lesson.readingMinutes,
        hasQuiz: lesson.hasQuiz,
      })),
    })),
  };
}

function previewQuizToHub(
  quiz: NonNullable<PreviewLesson["quiz"]>,
): HubQuizView {
  return {
    passThreshold: Math.round(quiz.passScore * 100),
    questions: quiz.questions.map((question) => {
      if (question.type === "single") {
        return {
          id: question.id,
          type: "multiple_choice" as const,
          prompt: question.prompt,
          options: question.choices,
        };
      }

      return {
        id: question.id,
        type: "short_text" as const,
        prompt: question.prompt,
      };
    }),
  };
}

function previewToLesson(
  program: PreviewProgram,
  lesson: PreviewLesson,
): HubLessonDetail {
  const flat = program.tracks.flatMap((track) =>
    track.lessons.map((entry) => ({
      slug: entry.slug,
      title: entry.title,
      trackTitle: track.title,
    })),
  );

  return {
    slug: lesson.slug,
    programSlug: program.slug,
    programId: `preview:${program.slug}`,
    lessonVersionId: `preview:${program.slug}:${lesson.slug}`,
    programTitle: program.title,
    trackSlug: lesson.trackSlug,
    trackTitle: lesson.trackTitle,
    title: lesson.title,
    blurb: lesson.blurb,
    readingMinutes: lesson.readingMinutes,
    blocks: lesson.blocks,
    quiz: lesson.quiz ? previewQuizToHub(lesson.quiz) : null,
    navigation: {
      flat,
      index: flat.findIndex((entry) => entry.slug === lesson.slug),
    },
  };
}

async function withHubFallback<T>(
  loader: () => Promise<T>,
): Promise<T | null> {
  try {
    return await loader();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return null;
    }
    throw error;
  }
}

export async function loadHubPrograms(): Promise<HubProgramSummary[]> {
  if (PREVIEW_MODE) {
    return listPreviewPrograms().map(previewToSummary);
  }

  const ctx = await resolveTenantContext();
  return listHubProgramSummaries(ctx);
}

export async function loadHubProgram(
  programSlug: string,
): Promise<HubProgramDetail | null> {
  if (PREVIEW_MODE) {
    const program = getPreviewProgramBySlug(programSlug);
    return program ? previewToDetail(program) : null;
  }

  const ctx = await resolveTenantContext();
  return withHubFallback(() => getHubProgramDetail(ctx, programSlug));
}

export async function loadHubLesson(input: {
  programSlug: string;
  lessonSlug: string;
}): Promise<HubLessonDetail | null> {
  if (PREVIEW_MODE) {
    const program = getPreviewProgramBySlug(input.programSlug);
    const lesson = findLesson(input.programSlug, input.lessonSlug);
    if (!program || !lesson) {
      return null;
    }
    return previewToLesson(program, lesson);
  }

  const ctx = await resolveTenantContext();
  return withHubFallback(() => getHubLessonDetail(ctx, input));
}

export async function loadHubStaticParams(): Promise<
  Array<{ programSlug: string; lessonSlug?: string }>
> {
  const programs = await loadHubPrograms();
  const params: Array<{ programSlug: string; lessonSlug?: string }> = programs.map(
    (program) => ({ programSlug: program.slug }),
  );

  if (PREVIEW_MODE) {
    for (const program of listPreviewPrograms()) {
      for (const track of program.tracks) {
        for (const lesson of track.lessons) {
          params.push({
            programSlug: program.slug,
            lessonSlug: lesson.slug,
          });
        }
      }
    }
  }

  return params;
}

export { PREVIEW_MODE, estimateProgramHours, localeText, toHubQuizView };
