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

export const createFirstLessonSchema = z.object({
  title: z.string().trim().min(1).max(200),
  slug: programSlugSchema,
});

export type CreateProgramInput = z.infer<typeof createProgramSchema>;
export type UpdateProgramDetailsInput = z.infer<typeof updateProgramDetailsSchema>;
export type CreateFirstLessonInput = z.infer<typeof createFirstLessonSchema>;
