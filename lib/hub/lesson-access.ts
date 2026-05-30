import type { TenantContext } from "@/lib/tenant/context";

export type LessonAccessDenied =
  | {
      reason: "sign_in";
      firstLessonSlug: string;
    }
  | {
      reason: "enroll";
      programSlug: string;
      firstLessonSlug: string;
    };

export type LessonAccessResult =
  | { allowed: true }
  | { allowed: false; gate: LessonAccessDenied };

export function resolveLessonAccess(input: {
  ctx: TenantContext;
  programSlug: string;
  lessonIndex: number;
  firstLessonSlug: string;
  isEnrolled: boolean;
  guestFirstLessonEnabled?: boolean;
}): LessonAccessResult {
  const guestFirst = input.guestFirstLessonEnabled ?? true;

  if (input.ctx.kind === "staff" || input.ctx.kind === "system") {
    return { allowed: true };
  }

  if (guestFirst && input.lessonIndex === 0) {
    return { allowed: true };
  }

  if (input.ctx.kind === "anonymous") {
    return {
      allowed: false,
      gate: {
        reason: "sign_in",
        firstLessonSlug: input.firstLessonSlug,
      },
    };
  }

  if (!input.isEnrolled) {
    return {
      allowed: false,
      gate: {
        reason: "enroll",
        programSlug: input.programSlug,
        firstLessonSlug: input.firstLessonSlug,
      },
    };
  }

  return { allowed: true };
}
