import { v2 as cloudinary } from "cloudinary";
import { AppError } from "@/lib/errors";

type CloudinaryCredentials = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

function parseCloudinaryUrl(cloudinaryUrl: string): CloudinaryCredentials {
  const match = cloudinaryUrl.match(/^cloudinary:\/\/([^:]+):([^@]+)@([^/?]+)/);
  if (!match?.[1] || !match[2] || !match[3]) {
    throw new AppError("CLOUDINARY_URL has an invalid format.", 503);
  }

  return {
    apiKey: match[1],
    apiSecret: match[2],
    cloudName: match[3],
  };
}

function getCloudinaryCredentials(): CloudinaryCredentials {
  const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
  if (cloudinaryUrl) {
    return parseCloudinaryUrl(cloudinaryUrl);
  }

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
  const apiKey = process.env.CLOUDINARY_API_KEY?.trim();
  const apiSecret = process.env.CLOUDINARY_API_SECRET?.trim();

  if (cloudName && apiKey && apiSecret) {
    return { cloudName, apiKey, apiSecret };
  }

  throw new AppError(
    "Cloudinary is not configured. Set CLOUDINARY_URL (or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET) in .env.local and restart the dev server.",
    503,
  );
}

export function getCloudinaryCloudName() {
  return getCloudinaryCredentials().cloudName;
}

export function getCloudinaryClient() {
  const { cloudName, apiKey, apiSecret } = getCloudinaryCredentials();

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
  });

  return cloudinary;
}
