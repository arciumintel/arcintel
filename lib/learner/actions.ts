"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { ConflictError, UnauthorizedError } from "@/lib/errors";
import { createProgramEnrollment } from "@/lib/tenant/repositories/enrollments";
import { resolveTenantContext } from "@/lib/tenant/context";

export type EnrollActionResult =
  | { ok: true }
  | { ok: false; error: string };

export async function enrollProgramAction(
  programSlug: string,
): Promise<EnrollActionResult | undefined> {
  const ctx = await resolveTenantContext();

  if (ctx.kind === "anonymous" || ctx.kind === "system") {
    redirect(
      `/login?next=${encodeURIComponent(`/programs/${programSlug}`)}`,
    ) as never;
  }

  try {
    const enrollment = await createProgramEnrollment(ctx, programSlug);
    revalidatePath(`/programs/${programSlug}`);
    revalidatePath("/account");
    revalidatePath("/");

    const lessonTarget = enrollment.continueLessonSlug ?? enrollment.firstLessonSlug;
    if (lessonTarget) {
      redirect(
        `/programs/${programSlug}/lessons/${lessonTarget}?enrolled=1`,
      ) as never;
    }

    redirect(`/programs/${programSlug}?enrolled=1`) as never;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof UnauthorizedError) {
      return { ok: false, error: "Sign in to enroll in this program." };
    }
    if (error instanceof ConflictError) {
      return { ok: false, error: "You are already enrolled in this program." };
    }
    throw error;
  }
}
