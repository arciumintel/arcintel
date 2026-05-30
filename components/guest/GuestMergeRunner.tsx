"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { runGuestProgressMerge } from "@/lib/guest/run-merge";

export default function GuestMergeRunner() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const ranForUserRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = session?.user?.id;
    if (!userId || ranForUserRef.current === userId) return;

    ranForUserRef.current = userId;

    void (async () => {
      const merged = await runGuestProgressMerge();
      if (merged > 0) {
        router.refresh();
      }
    })();
  }, [session?.user?.id, router]);

  return null;
}
