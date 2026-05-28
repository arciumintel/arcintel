"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function SignOutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    await authClient.signOut();
    setPending(false);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => void handleSignOut()}
      disabled={pending}
      className="font-display italic text-[0.96rem] text-ink-muted underline decoration-rule decoration-1 underline-offset-4 transition-colors hover:text-accent hover:decoration-accent disabled:opacity-60"
      style={{ fontVariationSettings: "'opsz' 144" }}
    >
      {pending ? "Signing out…" : "Sign out"}
    </button>
  );
}
