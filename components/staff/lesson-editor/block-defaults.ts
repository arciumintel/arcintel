import type { ContentBlock } from "@/lib/content-blocks/schema";
import type { QuizQuestion, ScoringConfig } from "@/lib/quiz/schema";

export function createEmptyBlock(type: ContentBlock["type"]): ContentBlock {
  switch (type) {
    case "heading":
      return { type: "heading", level: 2, text: { en: "" } };
    case "paragraph":
      return { type: "paragraph", text: { en: "" } };
    case "callout":
      return { type: "callout", variant: "note", text: { en: "" } };
    case "code":
      return { type: "code", language: "typescript", snippet: "" };
    case "image":
      return {
        type: "image",
        cloudinary_url: "",
        alt: { en: "" },
      };
    case "divider":
      return { type: "divider" };
  }
}

export function defaultScoringConfig(): ScoringConfig {
  return {
    passThreshold: 70,
    masteryThreshold: 90,
    maxAttempts: 3,
    cooldownSeconds: 0,
  };
}

export function createEmptyQuestion(type: QuizQuestion["type"]): QuizQuestion {
  const id = `q-${crypto.randomUUID().slice(0, 8)}`;
  switch (type) {
    case "short_text":
      return {
        id,
        type: "short_text",
        prompt: "",
        points: 1,
        correctAnswer: "",
      };
    case "multiple_choice":
      return {
        id,
        type: "multiple_choice",
        prompt: "",
        points: 1,
        options: ["", ""],
        correctAnswer: "",
      };
    case "true_false":
      return {
        id,
        type: "true_false",
        prompt: "",
        points: 1,
        correctAnswer: "true",
      };
  }
}
