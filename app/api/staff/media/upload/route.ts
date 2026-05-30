import { AppError } from "@/lib/errors";
import { uploadStaffImage } from "@/lib/cloudinary/upload";
import { resolveTenantContext } from "@/lib/tenant/context";
import { requireStaff } from "@/lib/tenant/require-staff";

export const runtime = "nodejs";

function jsonError(error: unknown) {
  if (error instanceof AppError) {
    return Response.json({ error: error.message }, { status: error.status });
  }

  console.error("Staff media upload failed:", error);
  return Response.json({ error: "Upload failed." }, { status: 500 });
}

export async function POST(request: Request) {
  try {
    const ctx = await resolveTenantContext();
    requireStaff(ctx);

    const formData = await request.formData();
    const file = formData.get("file");
    const folder = formData.get("folder");

    if (!(file instanceof File)) {
      throw new AppError("Missing image file.", 400);
    }

    const uploaded = await uploadStaffImage(file, {
      folder: typeof folder === "string" ? folder : null,
    });

    return Response.json(uploaded, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
