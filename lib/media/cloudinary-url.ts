import { getCloudinaryCloudName } from "@/lib/cloudinary/config";

const ALLOWED_HOSTS = new Set(["res.cloudinary.com"]);

export function isAllowedCloudinaryUrl(url: string) {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }

  if (parsed.protocol !== "https:" || !ALLOWED_HOSTS.has(parsed.hostname)) {
    return false;
  }

  const cloudName = getCloudinaryCloudName();
  const prefix = `/image/upload/`;
  const legacyPrefix = `/${cloudName}/image/upload/`;

  return (
    parsed.pathname.startsWith(`/${cloudName}${prefix}`) ||
    parsed.pathname.startsWith(legacyPrefix)
  );
}
