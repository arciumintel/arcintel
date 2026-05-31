import { z } from "zod";
import { lessonBlocksSchema } from "@/lib/content-blocks/schema";
import { quizQuestionsSchema, scoringConfigSchema } from "@/lib/quiz/schema";

export const saveDraftLessonBlocksSchema = z.object({
  blocks: lessonBlocksSchema,
});

export const saveDraftLessonQuizSchema = z.object({
  questions: quizQuestionsSchema.min(1),
  scoringConfig: scoringConfigSchema,
});
