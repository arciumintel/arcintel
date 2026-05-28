"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import { sanitizeUsername } from "@/lib/username";
import type { SocialAuthProvider } from "@/lib/auth-providers";
import SocialAuthButtons from "./SocialAuthButtons";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

type RegisterFormProps = {
  socialProviders: SocialAuthProvider[];
  callbackURL?: string;
};

export default function RegisterForm({
  socialProviders,
  callbackURL = "/account",
}: RegisterFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedUsername = sanitizeUsername(username);
    if (normalizedUsername.length < 3) {
      setError("Username must be at least 3 characters (letters, numbers, underscores).");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setPending(true);
    const { error: signUpError } = await authClient.signUp.email({
      name: name.trim(),
      email: email.trim(),
      password,
      username: normalizedUsername,
      callbackURL,
    });
    setPending(false);

    if (signUpError) {
      setError(signUpError.message ?? "Could not create your account.");
      return;
    }

    router.push(callbackURL);
    router.refresh();
  }

  const hasSocial = socialProviders.length > 0;

  return (
    <div className="space-y-8">
      {hasSocial ? (
        <section aria-labelledby="register-social-heading">
          <h2
            id="register-social-heading"
            className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft"
          >
            Social
          </h2>
          <SocialAuthButtons
            providers={socialProviders}
            callbackURL={callbackURL}
            errorCallbackURL="/register"
            mode="sign-up"
          />
        </section>
      ) : null}

      {hasSocial ? (
        <div className="flex items-center gap-3" aria-hidden>
          <span className="h-px flex-1 bg-rule" />
          <span className="font-mono text-[0.58rem] uppercase tracking-[0.2em] text-ink-soft">or</span>
          <span className="h-px flex-1 bg-rule" />
        </div>
      ) : null}

      <section aria-labelledby="register-email-heading">
        <h2
          id="register-email-heading"
          className="mb-4 font-mono text-[0.62rem] uppercase tracking-[0.18em] text-ink-soft"
        >
          Email
        </h2>
        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="register-name" className="font-ui text-[0.8rem] font-medium text-ink">
              Full name
            </label>
            <input
              id="register-name"
              name="name"
              type="text"
              autoComplete="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label htmlFor="register-username" className="font-ui text-[0.8rem] font-medium text-ink">
              Username
            </label>
            <input
              id="register-username"
              name="username"
              type="text"
              autoComplete="username"
              required
              spellCheck={false}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1.5 font-mono text-[0.58rem] uppercase tracking-[0.14em] text-ink-soft">
              Lowercase letters, numbers, underscores
            </p>
          </div>

          <div>
            <label htmlFor="register-email" className="font-ui text-[0.8rem] font-medium text-ink">
              Email
            </label>
            <input
              id="register-email"
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
            <label htmlFor="register-password" className="font-ui text-[0.8rem] font-medium text-ink">
              Password
            </label>
            <input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputClass}
            />
          </div>

          <div>
            <label
              htmlFor="register-confirm-password"
              className="font-ui text-[0.8rem] font-medium text-ink"
            >
              Confirm password
            </label>
            <input
              id="register-confirm-password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
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
            {pending ? "Creating account…" : "Create account"}
          </button>
        </form>
      </section>

      <p className="font-body text-[0.88rem] leading-[1.55] text-ink-muted">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-display italic text-ink underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent"
          style={{ fontVariationSettings: "'opsz' 144" }}
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
