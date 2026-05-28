import AuthShell from "@/components/auth/AuthShell";
import LoginForm from "@/components/auth/LoginForm";
import { getEnabledSocialProviders } from "@/lib/auth-providers";

export const metadata = {
  title: "Sign in",
  description: "Sign in to Arcidex to resume lessons and track progress across programs.",
};

export default function LoginPage() {
  const socialProviders = getEnabledSocialProviders();

  return (
    <AuthShell
      eyebrow="Account"
      title="Sign in."
      lede="Pick up lessons, quizzes, and enrollments where you left off."
    >
      <LoginForm socialProviders={socialProviders} />
    </AuthShell>
  );
}
