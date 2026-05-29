"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { resolveTenantContext } from "@/lib/tenant/context";
import { requireStaff } from "@/lib/tenant/require-staff";
import {
  createFirstLessonSchema,
  createProgramSchema,
  updateProgramDetailsSchema,
} from "@/lib/validation/staff-program";
import {
  createFirstDraftLesson,
  createProgram,
  updateProgramDetails,
} from "@/lib/tenant/repositories/staff-programs";
import { ConflictError } from "@/lib/errors";

export type StaffActionResult = {
  ok: false;
  errors: Record<string, string[] | undefined>;
};

function fieldErrors(error: { flatten: () => { fieldErrors: Record<string, string[] | undefined> } }) {
  return error.flatten().fieldErrors;
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

  revalidatePath(
    `/staff/organizations/${orgSlug}/programs/${programSlug}`,
  );
  revalidatePath(
    `/staff/organizations/${orgSlug}/programs/${programSlug}/settings`,
  );
  return redirect(
    `/staff/organizations/${orgSlug}/programs/${programSlug}/settings?saved=1`,
  ) as never;
}

export async function createFirstLessonAction(
  orgSlug: string,
  programSlug: string,
  _prev: StaffActionResult | undefined,
  formData: FormData,
): Promise<StaffActionResult | undefined> {
  const ctx = await resolveTenantContext();
  requireStaff(ctx);

  const parsed = createFirstLessonSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug"),
  });

  if (!parsed.success) {
    return { ok: false, errors: fieldErrors(parsed.error) };
  }

  try {
    await createFirstDraftLesson(ctx, {
      orgSlug,
      programSlug,
      title: parsed.data.title,
      slug: parsed.data.slug,
    });

    revalidatePath(
      `/staff/organizations/${orgSlug}/programs/${programSlug}`,
    );
    revalidatePath(
      `/staff/organizations/${orgSlug}/programs/${programSlug}/curriculum`,
    );
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
