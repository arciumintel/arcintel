import type { UploadApiResponse } from "cloudinary";
import { AppError } from "@/lib/errors";
import { getCloudinaryClient } from "@/lib/cloudinary/config";
import { isAllowedCloudinaryUrl } from "@/lib/media/cloudinary-url";

const DEFAULT_FOLDER = "arcademy";
const MAX_BYTES = 10 * 1024 * 1024;

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export type UploadedImage = {
  cloudinary_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

function sanitizeFolder(folder: string | null | undefined) {
  if (!folder) {
    return DEFAULT_FOLDER;
  }

  const trimmed = folder.trim();
  if (!trimmed || trimmed.length > 120) {
    throw new AppError("Invalid upload folder.", 400);
  }

  if (!/^[a-z0-9]+(?:[/_-][a-z0-9]+)*$/.test(trimmed)) {
    throw new AppError("Invalid upload folder.", 400);
  }

  return trimmed.startsWith(`${DEFAULT_FOLDER}/`) || trimmed === DEFAULT_FOLDER
    ? trimmed
    : `${DEFAULT_FOLDER}/${trimmed}`;
}

export async function uploadStaffImage(
  file: File,
  options?: { folder?: string | null },
): Promise<UploadedImage> {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    throw new AppError("Unsupported image type.", 400);
  }

  if (file.size <= 0 || file.size > MAX_BYTES) {
    throw new AppError("Image must be between 1 byte and 10 MB.", 400);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = sanitizeFolder(options?.folder);
  const cloudinary = getCloudinaryClient();

  const result = await new Promise<UploadApiResponse>((resolve, reject) => {
    const upload = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        allowed_formats: ["jpg", "jpeg", "png", "webp", "gif"],
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Cloudinary upload failed."));
          return;
        }
        resolve(uploadResult);
      },
    );

    upload.end(buffer);
  });

  const secureUrl = result.secure_url;
  if (!secureUrl || !isAllowedCloudinaryUrl(secureUrl)) {
    throw new AppError("Upload returned an invalid Cloudinary URL.", 502);
  }

  return {
    cloudinary_url: secureUrl,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}
