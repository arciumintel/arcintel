export type SocialAuthProvider = "github" | "google";

export function getEnabledSocialProviders(): SocialAuthProvider[] {
  const providers: SocialAuthProvider[] = [];
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push("github");
  }
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push("google");
  }
  return providers;
}
