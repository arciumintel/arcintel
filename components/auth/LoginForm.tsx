"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import type { SocialAuthProvider } from "@/lib/auth-providers";
import SocialAuthButtons from "./SocialAuthButtons";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

type LoginFormProps = {
  socialProviders: SocialAuthProvider[];
  callbackURL?: string;
};

export default function LoginForm({ socialProviders, callbackURL = "/account" }: LoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setPending(true);

    const { error: signInError } = await authClient.signIn.email({
      email: email.trim(),
      password,
      callbackURL,
    });
    setPending(false);

    if (signInError) {
      setError(signInError.message ?? "Could not sign you in.");
      return;
    }

    router.push(callbackURL);
    router.refresh();
  }

  const hasSocial = socialProviders.length > 0;

  return (
    <div className="space-y-8">
      {hasSocial ? (
        <section aria-labelledby="login-social-heading">
          <h2
            id="login-social-heading"
            className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft"
          >
            Social
          </h2>
          <SocialAuthButtons providers={socialProviders} callbackURL={callbackURL} />
        </section>
      ) : null}

      {hasSocial ? (
        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-rule" />
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink-soft">or</span>
          <span className="h-px flex-1 bg-rule" />
        </div>
      ) : null}

      <section aria-labelledby="login-email-heading">
        <h2
          id="login-email-heading"
          className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft"
        >
          Email
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="login-email" className="font-ui text-[0.8rem] font-medium text-ink">
              Email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="login-password" className="font-ui text-[0.8rem] font-medium text-ink">
              Password
            </label>
            <input
              id="login-password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          {error ? (
            <p className="font-body text-[0.9rem] text-accent" role="alert">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="ui-btn-filled mt-2 w-full rounded-[2px] bg-ink px-5 py-2.5 font-ui text-[0.84rem] font-medium text-paper-deep hover:bg-accent disabled:cursor-not-allowed disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </section>

      <p className="font-body text-[0.88rem] leading-[1.55] text-ink-muted">
        New here?{" "}
        <Link
          href="/register"
          className="font-display italic text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}
