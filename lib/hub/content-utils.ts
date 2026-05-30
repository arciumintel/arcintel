import type { ContentBlock } from "@/lib/content-blocks/schema";
import type { PublicQuiz } from "@/lib/quiz/public";
import type { HubQuizView } from "@/lib/hub/types";

export function localeText(
  map: Record<string, string> | string,
  fallback = "",
): string {
  if (typeof map === "string") {
    return map;
  }

  return map.en ?? Object.values(map)[0] ?? fallback;
}

export function blurbFromBlocks(blocks: ContentBlock[]): string {
  for (const block of blocks) {
    if (block.type === "paragraph") {
      const text = localeText(block.text);
      if (!text) continue;
      return text.length > 160 ? `${text.slice(0, 157)}...` : text;
    }
  }

  return "";
}

export function readingMinutesFromBlocks(blocks: ContentBlock[]): number {
  let words = 0;

  for (const block of blocks) {
    if (block.type === "paragraph" || block.type === "callout") {
      words += localeText(block.text).split(/\s+/).filter(Boolean).length;
    } else if (block.type === "heading") {
      words += localeText(block.text).split(/\s+/).filter(Boolean).length;
    } else if (block.type === "code") {
      words += 50;
    }
  }

  return Math.max(1, Math.ceil(words / 200));
}

export function estimateProgramHours(lessonCount: number): number {
  return Math.max(1, Math.ceil((lessonCount * 10) / 60));
}

function toHubQuizQuestionImage(
  image: NonNullable<PublicQuiz["questions"][number]["image"]>,
) {
  return {
    cloudinary_url: image.cloudinary_url,
    alt: localeText(image.alt),
  };
}

export function toHubQuizView(quiz: PublicQuiz): HubQuizView {
  return {
    passThreshold: quiz.scoringConfig.passThreshold,
    questions: quiz.questions.map((question) => {
      const image = question.image ? toHubQuizQuestionImage(question.image) : undefined;

      if (question.type === "multiple_choice") {
        return {
          id: question.id,
          type: "multiple_choice" as const,
          prompt: question.prompt,
          options: question.options,
          ...(image ? { image } : {}),
        };
      }

      if (question.type === "true_false") {
        return {
          id: question.id,
          type: "true_false" as const,
          prompt: question.prompt,
          ...(image ? { image } : {}),
        };
      }

      return {
        id: question.id,
        type: "short_text" as const,
        prompt: question.prompt,
        ...(image ? { image } : {}),
      };
    }),
  };
}
