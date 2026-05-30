import { z } from "zod";

/** Locale map for image alt text (matches lesson block `alt` / `caption` shape). */
const quizImageAltSchema = z
  .object({
    en: z.string().min(1),
  })
  .catchall(z.string());

/** Optional prompt illustration; same Cloudinary + alt shape as lesson `image` blocks. */
export const quizQuestionImageSchema = z.object({
  cloudinary_url: z.string().url().max(2048),
  alt: quizImageAltSchema,
});

const baseQuestionSchema = z.object({
  id: z.string().min(1).max(120),
  prompt: z.string().min(1).max(5000),
  points: z.number().int().min(1).max(100).default(1),
  image: quizQuestionImageSchema.optional(),
});

export const shortTextQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("short_text"),
  correctAnswer: z.string().min(1).max(500),
  explanation: z.string().max(5000).optional(),
});

export const multipleChoiceQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("multiple_choice"),
  options: z.array(z.string().min(1).max(500)).min(2).max(10),
  correctAnswer: z.string().min(1).max(500),
  explanation: z.string().max(5000).optional(),
});

export const trueFalseQuestionSchema = baseQuestionSchema.extend({
  type: z.literal("true_false"),
  correctAnswer: z.enum(["true", "false"]),
  explanation: z.string().max(5000).optional(),
});

export const quizQuestionSchema = z.discriminatedUnion("type", [
  shortTextQuestionSchema,
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema,
]);

export const quizQuestionsSchema = z.array(quizQuestionSchema).max(50);

export const scoringConfigSchema = z.object({
  passThreshold: z.number().min(0).max(100).default(70),
  masteryThreshold: z.number().min(0).max(100).default(90),
  maxAttempts: z.number().int().min(1).max(20).default(3),
  cooldownSeconds: z.number().int().min(0).max(86400).default(0),
});

export type QuizQuestionImage = z.infer<typeof quizQuestionImageSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type ScoringConfig = z.infer<typeof scoringConfigSchema>;

export function parseQuizQuestions(input: unknown) {
  return quizQuestionsSchema.safeParse(input);
}

export function parseScoringConfig(input: unknown) {
  return scoringConfigSchema.safeParse(input);
}
