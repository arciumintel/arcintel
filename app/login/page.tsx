import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getEnabledSocialProviders } from "@/lib/auth-providers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sign in",
  description: "Sign in to Arcademy to resume lessons and track progress across programs.",
};

function oauthErrorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code === "account_not_linked") {
    return "That email is already on Arcademy with a different sign-in method. Use the provider you signed up with, or create a password from Account after signing in.";
  }
  if (code === "signup_disabled") {
    return "No account exists for that provider yet. Use Create account, or sign in with email.";
  }
  return "Social sign-in could not be completed. Please try again.";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: errorCode } = await searchParams;
  const socialProviders = getEnabledSocialProviders();

  return (
    <AuthShell
      eyebrow="Account"
      title="Sign in."
      lede="Pick up lessons, quizzes, and enrollments where you left off."
    >
      <LoginForm socialProviders={socialProviders} oauthError={oauthErrorMessage(errorCode)} />
    </AuthShell>
  );
}
