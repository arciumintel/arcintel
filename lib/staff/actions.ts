"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { resolveTenantContext } from "@/lib/tenant/context";
import { requireStaff } from "@/lib/tenant/require-staff";
import {
  draftLessonSchema,
  createProgramSchema,
  reorderDraftLessonSchema,
  updateProgramDetailsSchema,
} from "@/lib/validation/staff-program";
import {
  createDraftLesson,
  createProgram,
  deleteDraftLesson,
  reorderDraftLesson,
  updateDraftLessonMetadata,
  updateProgramDetails,
} from "@/lib/tenant/repositories/staff-programs";
import { AppError, ConflictError } from "@/lib/errors";

export type StaffActionResult = {
  ok: false;
  errors: Record<string, string[] | undefined>;
};

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  return error.flatten().fieldErrors;
}

function staffProgramPaths(orgSlug: string, programSlug: string) {
  const base = `/staff/organizations/${orgSlug}/programs/${programSlug}`;
  return {
    base,
    curriculum: `${base}/curriculum`,
  };
}

function revalidateStaffProgram(orgSlug: string, programSlug: string) {
  const paths = staffProgramPaths(orgSlug, programSlug);
  revalidatePath(paths.base);
  revalidatePath(paths.curriculum);
}

export async function createProgramAction(
  orgSlug: string,
  _prev: StaffActionResult | undefined,
  formData: FormData,
): Promise<StaffActionResult | undefined> {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  const parsed = createProgramSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
    tagline: formData.get("tagline") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  try {
    const { programSlug } = await createProgram(ctx, {
      orgSlug,
      title: parsed.data.title,
      slug: parsed.data.slug,
      tagline: parsed.data.tagline ? parsed.data.tagline : null,
    });

    revalidatePath(`/staff/organizations/${orgSlug}`);
    return redirect(
      `/staff/organizations/${orgSlug}/programs/${programSlug}?created=1`,
    ) as never;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof ConflictError) {
      return { ok: false, errors: { slug: ["Slug already in use for this organization."] } };
    }
    throw error;
  }
}

export async function updateProgramDetailsAction(
  orgSlug: string,
  programSlug: string,
  _prev: StaffActionResult | undefined,
  formData: FormData,
): Promise<StaffActionResult | undefined> {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  const parsed = updateProgramDetailsSchema.safeParse({
    title: formData.get("title"),
    tagline: formData.get("tagline") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  await updateProgramDetails(ctx, {
    orgSlug,
    programSlug,
    title: parsed.data.title,
    tagline: parsed.data.tagline ? parsed.data.tagline : null,
  });

  revalidateStaffProgram(orgSlug, programSlug);
  revalidatePath(
    `/staff/organizations/${orgSlug}/programs/${programSlug}/settings`,
  );
  return redirect(
    `/staff/organizations/${orgSlug}/programs/${programSlug}/settings?saved=1`,
  ) as never;
}

export async function createDraftLessonAction(
  orgSlug: string,
  programSlug: string,
  _prev: StaffActionResult | undefined,
  formData: FormData,
): Promise<StaffActionResult | undefined> {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  const parsed = draftLessonSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  const redirectToCurriculum = formData.get("redirectTo") === "curriculum";

  try {
    await createDraftLesson(ctx, {
      orgSlug,
      programSlug,
      title: parsed.data.title,
      slug: parsed.data.slug,
    });

    revalidateStaffProgram(orgSlug, programSlug);

    if (redirectToCurriculum) {
      return redirect(
        `/staff/organizations/${orgSlug}/programs/${programSlug}/curriculum?lessonCreated=1`,
      ) as never;
    }

    return redirect(
      `/staff/organizations/${orgSlug}/programs/${programSlug}?lessonCreated=1`,
    ) as never;
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    if (error instanceof ConflictError) {
      return { ok: false, errors: { slug: ["Lesson slug already in use."] } };
    }
    throw error;
  }
}

/** @deprecated Use createDraftLessonAction */
export const createFirstLessonAction = createDraftLessonAction;

export async function updateDraftLessonAction(
  orgSlug: string,
  programSlug: string,
  lessonSlug: string,
  _prev: StaffActionResult | undefined,
  formData: FormData,
): Promise<StaffActionResult | undefined> {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  const parsed = draftLessonSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  try {
    const result = await updateDraftLessonMetadata(ctx, {
      orgSlug,
      programSlug,
      lessonSlug,
      title: parsed.data.title,
      slug: parsed.data.slug,
    });

    revalidateStaffProgram(orgSlug, programSlug);
    revalidatePath(
      `/staff/organizations/${orgSlug}/programs/${programSlug}/curriculum/lessons/${result.slug}`,
    );

    return undefined;
  } catch (error) {
    if (error instanceof ConflictError) {
      return { ok: false, errors: { slug: ["Lesson slug already in use."] } };
    }
    throw error;
  }
}

export async function reorderDraftLessonAction(
  orgSlug: string,
  programSlug: string,
  lessonSlug: string,
  direction: "up" | "down",
) {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  const parsed = reorderDraftLessonSchema.safeParse({ direction });
  if (!parsed.success) {
    return;
  }

  await reorderDraftLesson(ctx, {
    orgSlug,
    programSlug,
    lessonSlug,
    direction: parsed.data.direction,
  });

  revalidateStaffProgram(orgSlug, programSlug);
}

export async function deleteDraftLessonAction(
  orgSlug: string,
  programSlug: string,
  lessonSlug: string,
) {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  try {
    await deleteDraftLesson(ctx, { orgSlug, programSlug, lessonSlug });
    revalidateStaffProgram(orgSlug, programSlug);
  } catch (error) {
    if (error instanceof AppError && error.status === 400) {
      throw error;
    }
    throw error;
  }
}
