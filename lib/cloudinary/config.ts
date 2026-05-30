import { v2 as cloudinary } from "cloudinary";
import { AppError } from "@/lib/errors";

function requireCloudinaryUrl() {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (!cloudinaryUrl) {
    throw new AppError("Cloudinary is not configured.", 503);
  }
  return cloudinaryUrl;
}

export function getCloudinaryCloudName() {
  const cloudinaryUrl = requireCloudinaryUrl();
  const match = cloudinaryUrl.match(/^cloudinary:\/\/[^:]+:[^@]+@([^/?]+)/);
  if (!match?.[1]) {
    throw new AppError("CLOUDINARY_URL has an invalid format.", 503);
  }
  return match[1];
}

export function getCloudinaryClient() {
  requireCloudinaryUrl();
  cloudinary.config({ secure: true });
  return cloudinary;
}
