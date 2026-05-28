const USERNAME_MAX = 32;

/** Normalize to the same shape stored in `user.username`. */
export function sanitizeUsername(raw: string): string {
  const normalized = raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, USERNAME_MAX);

  return normalized.length > 0 ? normalized : "user";
}

export function usernameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "user";
  return sanitizeUsername(local);
}
