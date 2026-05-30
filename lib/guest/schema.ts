import { z } from "zod";

export const GUEST_PROGRESS_SCHEMA_VERSION = 2 as const;
export const GUEST_STORAGE_PREFIX = "arcademy.guest.v2";

export const guestQuizAttemptSchema = z.object({
  submittedAt: z.string().datetime(),
  score: z.number().min(0).max(100),
  passed: z.boolean(),
});

export const guestProgressPayloadSchema = z.object({
  schemaVersion: z.literal(GUEST_PROGRESS_SCHEMA_VERSION),
  programId: z.string().uuid(),
  lessonVersionId: z.string().uuid(),
  readAt: z.string().datetime(),
  quizAttempt: guestQuizAttemptSchema.optional(),
});

export type GuestProgressPayload = z.infer<typeof guestProgressPayloadSchema>;

export function guestStorageKey(programId: string, lessonVersionId: string) {
  return `${GUEST_STORAGE_PREFIX}:${programId}:${lessonVersionId}`;
}
