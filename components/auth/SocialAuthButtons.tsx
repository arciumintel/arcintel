"use client";

import { Github } from "lucide-react";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { SocialAuthProvider } from "@/lib/auth-providers";

const LABELS: Record<SocialAuthProvider, string> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

function SocialProviderIcon({ provider }: { provider: SocialAuthProvider }) {
  if (provider === "github") {
    return <Github size={18} strokeWidth={1.75} className="shrink-0" aria-hidden />;
  }

  return (
    <svg
      className="h-[18px] w-[18px] shrink-0"
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

type SocialAuthMode = "sign-in" | "sign-up";

type SocialAuthButtonsProps = {
  providers: SocialAuthProvider[];
  callbackURL?: string;
  errorCallbackURL?: string;
  /** sign-up sets requestSignUp so OAuth can create users from /register. */
  mode?: SocialAuthMode;
  showUnavailableHint?: boolean;
};

export default function SocialAuthButtons({
  providers,
  callbackURL = "/account",
  errorCallbackURL,
  mode = "sign-in",
  showUnavailableHint = true,
}: SocialAuthButtonsProps) {
  const [pending, setPending] = useState<SocialAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const noneConfigured = providers.length === 0;

  async function handleSocial(provider: SocialAuthProvider) {
    setError(null);
    setPending(provider);
    const { error: signInError } = await authClient.signIn.social({
      provider,
      callbackURL,
      errorCallbackURL,
      ...(mode === "sign-up" ? { requestSignUp: true } : {}),
    });
    setPending(null);
    if (signInError) {
      setError(signInError.message ?? "Could not start social sign-in.");
    }
  }

  if (noneConfigured) {
    if (!showUnavailableHint) {
      return null;
    }
    return (
      <p className="font-mono text-[0.62rem] uppercase tracking-[0.16em] text-ink-soft">
        Social sign-in is not configured in this environment.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {providers.map((id) => (
        <button
          key={id}
          type="button"
          disabled={pending !== null}
          onClick={() => void handleSocial(id)}
          className="ui-btn-filled flex w-full items-center justify-center gap-2.5 rounded-[2px] border border-ink bg-paper-deep px-4 py-2.5 font-ui text-[0.84rem] font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          <SocialProviderIcon provider={id} />
          <span>{pending === id ? "Redirecting…" : LABELS[id]}</span>
        </button>
      ))}
      {error ? (
        <p className="font-body text-[0.9rem] text-accent" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
