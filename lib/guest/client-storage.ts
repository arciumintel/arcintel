"use client";

import {
  GUEST_STORAGE_PREFIX,
  guestProgressPayloadSchema,
  guestStorageKey,
  type GuestProgressPayload,
} from "@/lib/guest/schema";

export function writeGuestLessonRead(input: {
  programId: string;
  lessonVersionId: string;
}) {
  if (typeof window === "undefined") return;

  const payload: GuestProgressPayload = {
    schemaVersion: 2,
    programId: input.programId,
    lessonVersionId: input.lessonVersionId,
    readAt: new Date().toISOString(),
  };

  window.localStorage.setItem(
    guestStorageKey(input.programId, input.lessonVersionId),
    JSON.stringify(payload),
  );
}

export function collectGuestProgressPayloads(): GuestProgressPayload[] {
  if (typeof window === "undefined") return [];

  const payloads: GuestProgressPayload[] = [];

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key?.startsWith(`${GUEST_STORAGE_PREFIX}:`)) continue;

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed = guestProgressPayloadSchema.safeParse(JSON.parse(raw));
      if (parsed.success) {
        payloads.push(parsed.data);
      } else {
        window.localStorage.removeItem(key);
      }
    } catch {
      window.localStorage.removeItem(key);
    }
  }

  return payloads;
}

export function clearGuestProgressKey(programId: string, lessonVersionId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(guestStorageKey(programId, lessonVersionId));
}
