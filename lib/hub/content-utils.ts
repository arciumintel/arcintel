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

export function toHubQuizView(quiz: PublicQuiz): HubQuizView {
  return {
    passThreshold: quiz.scoringConfig.passThreshold,
    questions: quiz.questions.map((question) => {
      if (question.type === "multiple_choice") {
        return {
          id: question.id,
          type: "multiple_choice" as const,
          prompt: question.prompt,
          options: question.options,
        };
      }

      if (question.type === "true_false") {
        return {
          id: question.id,
          type: "true_false" as const,
          prompt: question.prompt,
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
