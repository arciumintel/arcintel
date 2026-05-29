"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

type StaffFlashToastProps = {
  param: "created" | "saved" | "lessonCreated";
  title: string;
  body: string;
};

export default function StaffFlashToast({ param, title, body }: StaffFlashToastProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (searchParams.get(param) !== "1") {
      return;
    }

    setVisible(true);
    const url = new URL(window.location.href);
    url.searchParams.delete(param);
    router.replace(url.pathname + url.search, { scroll: false });
  }, [param, router, searchParams]);

  if (!visible) {
    return null;
  }

  return (
    <div
      className="mb-6 flex items-start justify-between gap-4 rounded-sm border border-rule bg-paper-deep px-4 py-3 md:float-right md:mb-0 md:ml-6 md:max-w-sm"
      role="status"
    >
      <div className="flex gap-3">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-soft text-sage">
          <Check className="h-3.5 w-3.5" aria-hidden />
        </span>
        <div>
          <p className="font-sans text-[0.9rem] font-medium text-ink">{title}</p>
          <p className="mt-0.5 font-body text-body-sm text-ink-muted">{body}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        className="font-sans text-[0.82rem] text-ink-soft hover:text-ink"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  );
}
