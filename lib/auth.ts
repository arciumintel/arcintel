import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { allocateUsername, sanitizeUsername, usernameFromEmail } from "@/lib/auth-username";
import { db } from "@/lib/db";

function getBaseUrl() {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

const authSecret = process.env.BETTER_AUTH_SECRET;

function buildSocialProviders() {
  const providers: Record<string, { clientId: string; clientSecret: string; mapProfileToUser?: (profile: Record<string, unknown>) => Promise<Record<string, unknown>> | Record<string, unknown> }> = {};

  const githubId = process.env.GITHUB_CLIENT_ID;
  const githubSecret = process.env.GITHUB_CLIENT_SECRET;
  if (githubId && githubSecret) {
    providers.github = {
      clientId: githubId,
      clientSecret: githubSecret,
      mapProfileToUser: async (profile) => {
        const login = typeof profile.login === "string" ? profile.login : undefined;
        const name =
          typeof profile.name === "string"
            ? profile.name
            : typeof profile.login === "string"
              ? profile.login
              : "GitHub user";
        const username = login ? await allocateUsername(login) : await allocateUsername("github_user");
        return { name, username };
      },
    };
  }

  const googleId = process.env.GOOGLE_CLIENT_ID;
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (googleId && googleSecret) {
    providers.google = {
      clientId: googleId,
      clientSecret: googleSecret,
      mapProfileToUser: async (profile) => {
        const email = typeof profile.email === "string" ? profile.email : undefined;
        const name = typeof profile.name === "string" ? profile.name : "Google user";
        const base = email ? usernameFromEmail(email) : "google_user";
        return {
          name,
          username: await allocateUsername(base),
        };
      },
    };
  }

  return providers;
}

export const auth = betterAuth({
  appName: "Arcidex",
  baseURL: getBaseUrl(),
  secret: authSecret,
  database: db,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: buildSocialProviders(),
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
        sortable: true,
        transform: {
          input(value) {
            return typeof value === "string" ? sanitizeUsername(value) : value;
          },
        },
      },
      role: {
        type: "string",
        defaultValue: "user",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const data = { ...user };
          if (!data.username || String(data.username).trim() === "") {
            const email = typeof data.email === "string" ? data.email : "";
            const name = typeof data.name === "string" ? data.name : "";
            const base = email ? usernameFromEmail(email) : sanitizeUsername(name || "user");
            data.username = await allocateUsername(base);
          } else {
            data.username = sanitizeUsername(String(data.username));
          }
          return { data };
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
