"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import type { SocialAuthProvider } from "@/lib/auth-providers";

const LABELS: Record<SocialAuthProvider, string> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

type SocialAuthButtonsProps = {
  providers: SocialAuthProvider[];
  callbackURL?: string;
  showUnavailableHint?: boolean;
};

export default function SocialAuthButtons({
  providers,
  callbackURL = "/account",
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
          className="ui-btn-filled flex w-full items-center justify-center rounded-[2px] border border-ink bg-paper-deep px-4 py-2.5 font-ui text-[0.84rem] font-medium text-ink transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending === id ? "Redirecting…" : LABELS[id]}
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
