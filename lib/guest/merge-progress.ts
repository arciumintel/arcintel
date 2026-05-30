"use server";

import { revalidatePath } from "next/cache";
import { guestProgressPayloadSchema, type GuestProgressPayload } from "@/lib/guest/schema";
import { mergeGuestLessonProgress } from "@/lib/tenant/repositories/guest-progress";
import { resolveTenantContext } from "@/lib/tenant/context";
import { ForbiddenError } from "@/lib/errors";

export type MergeGuestProgressResult =
  | { ok: true; programSlug: string }
  | { ok: false; error: string };

export async function mergeGuestProgress(
  payload: GuestProgressPayload,
): Promise<MergeGuestProgressResult> {
  const parsed = guestProgressPayloadSchema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Invalid guest progress payload." };
  }

  const ctx = await resolveTenantContext();
  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    return { ok: false, error: "Sign in to save guest progress." };
  }

  try {
    const result = await mergeGuestLessonProgress(ctx, parsed.data);
    revalidatePath("/account");
    revalidatePath(`/programs/${result.programSlug}`);
    revalidatePath(`/programs/${result.programSlug}/lessons`, "layout");
    return { ok: true, programSlug: result.programSlug };
  } catch (error) {
    if (error instanceof ForbiddenError) {
      return { ok: false, error: error.message };
    }
    throw error;
  }
}
