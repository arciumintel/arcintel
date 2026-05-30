import { describe, it, expect } from "vitest";
import { parseLessonBlocks } from "@/lib/content-blocks/schema";
import { parseQuizQuestions } from "@/lib/quiz/schema";
import { toPublicQuiz } from "@/lib/quiz/public";

describe("content schemas", () => {
  it("accepts valid lesson blocks", () => {
    const result = parseLessonBlocks([
      { type: "heading", level: 2, text: { en: "Title" } },
      { type: "paragraph", text: { en: "Body" } },
    ]);
    expect(result.success).toBe(true);
  });

  it("rejects invalid block type", () => {
    const result = parseLessonBlocks([{ type: "unknown", text: { en: "x" } }]);
    expect(result.success).toBe(false);
  });

  it("strips quiz answer keys for client payloads", () => {
    const questions = parseQuizQuestions([
      {
        id: "q1",
        type: "true_false",
        prompt: "Test?",
        points: 1,
        correctAnswer: "true",
        explanation: "Because.",
      },
    ]);
    expect(questions.success).toBe(true);
    if (!questions.success) return;

    const pub = toPublicQuiz({
      questions: questions.data,
      scoringConfig: {
        passThreshold: 70,
        masteryThreshold: 90,
        maxAttempts: 3,
        cooldownSeconds: 0,
      },
    });

    expect(pub.questions[0]).not.toHaveProperty("correctAnswer");
    expect(pub.questions[0]).not.toHaveProperty("explanation");
  });

  it("accepts optional image on quiz questions and keeps it in public payloads", () => {
    const questions = parseQuizQuestions([
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which diagram shows the correct flow?",
        points: 1,
        image: {
          cloudinary_url: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
          alt: { en: "Architecture diagram" },
        },
        options: ["A", "B"],
        correctAnswer: "A",
      },
    ]);
    expect(questions.success).toBe(true);
    if (!questions.success) return;

    const pub = toPublicQuiz({
      questions: questions.data,
      scoringConfig: {
        passThreshold: 70,
        masteryThreshold: 90,
        maxAttempts: 3,
        cooldownSeconds: 0,
      },
    });

    expect(pub.questions[0].image).toEqual({
      cloudinary_url: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
      alt: { en: "Architecture diagram" },
    });
  });

  it("rejects quiz question image without alt", () => {
    const result = parseQuizQuestions([
      {
        id: "q1",
        type: "true_false",
        prompt: "True?",
        image: {
          cloudinary_url: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
        },
        correctAnswer: "true",
      },
    ]);
    expect(result.success).toBe(false);
  });
});
