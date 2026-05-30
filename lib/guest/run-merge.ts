"use client";

import {
  clearGuestProgressKey,
  collectGuestProgressPayloads,
} from "@/lib/guest/client-storage";
import { mergeGuestProgress } from "@/lib/guest/merge-progress";

export async function runGuestProgressMerge(): Promise<number> {
  const payloads = collectGuestProgressPayloads();
  let merged = 0;

  for (const payload of payloads) {
    const result = await mergeGuestProgress(payload);
    if (result.ok) {
      clearGuestProgressKey(payload.programId, payload.lessonVersionId);
      merged += 1;
    }
  }

  return merged;
}
