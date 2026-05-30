import { z } from "zod";
import { slugSchema } from "@/lib/validation";

const programSlugSchema = slugSchema.max(80);

export const createProgramSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: programSlugSchema,
  tagline: z.string().trim().max(500).optional().or(z.literal("")),
});

export const updateProgramDetailsSchema = z.object({
  title: z.string().trim().min(1).max(200),
  tagline: z.string().trim().max(500).optional().or(z.literal("")),
});

export const draftLessonSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: programSlugSchema,
});

/** @deprecated Use draftLessonSchema */
export const createFirstLessonSchema = draftLessonSchema;

export const reorderDraftLessonSchema = z.object({
  direction: z.enum(["up", "down"]),
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramDetailsInput = z.infer<typeof updateProgramDetailsSchema>;
export type DraftLessonInput = z.infer<typeof draftLessonSchema>;
/** @deprecated Use DraftLessonInput */
export type CreateFirstLessonInput = DraftLessonInput;
