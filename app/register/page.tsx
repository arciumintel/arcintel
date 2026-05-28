import Link from "next/link";
import AuthShell from "@/components/auth/AuthShell";
import RegisterForm from "@/components/auth/RegisterForm";
import { getEnabledSocialProviders } from "@/lib/auth-providers";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Create account",
  description: "Create your Arcidex account to save progress across ecosystem programs.",
};

export default function RegisterPage() {
  const socialProviders = getEnabledSocialProviders();

  return (
    <AuthShell
      eyebrow="Account"
      title="Create your account."
      lede="One Arcidex identity tracks your progress across every program on the hub."
      footer={
        <>
          By continuing you agree to use Arcidex for ecosystem onboarding.{" "}
          <Link href="/programs" className="text-ink underline decoration-rule underline-offset-2">
            Browse programs
          </Link>
        </>
      }
    >
      <RegisterForm socialProviders={socialProviders} />
    </AuthShell>
  );
}
