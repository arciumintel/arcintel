import { db } from "@/lib/db";
import { sanitizeUsername, usernameFromEmail } from "@/lib/username";

export { sanitizeUsername, usernameFromEmail };

async function isUsernameTaken(username: string): Promise<boolean> {
  const { rows } = await db.query<{ exists: boolean }>(
    `select exists(select 1 from "user" where username = $1) as exists`,
    [username],
  );
  return rows[0]?.exists ?? false;
}

/** Pick a unique username, suffixing when the base is already registered. */
export async function allocateUsername(base: string): Promise<string> {
  const root = sanitizeUsername(base);
  if (!(await isUsernameTaken(root))) {
    return root;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = Math.random().toString(36).slice(2, 8);
    const maxRoot = 32 - suffix.length - 1;
    const candidate = `${root.slice(0, maxRoot)}_${suffix}`;
    if (!(await isUsernameTaken(candidate))) {
      return candidate;
    }
  }

  throw new Error("Could not allocate a unique username.");
}
