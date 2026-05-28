import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/lib/db";

function getBaseUrl() {
  return process.env.BETTER_AUTH_URL || "http://localhost:3000";
}

const authSecret = process.env.BETTER_AUTH_SECRET;

export const auth = betterAuth({
  appName: "Arcademy",
  baseURL: getBaseUrl(),
  secret: authSecret,
  database: db,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      username: {
        type: "string",
        required: true,
        unique: true,
        sortable: true,
        transform: {
          input(value) {
            return typeof value === "string" ? value.trim().toLowerCase() : value;
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
  plugins: [nextCookies()],
});

export type AuthSession = typeof auth.$Infer.Session;
