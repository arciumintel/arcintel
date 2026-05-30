"use client";

import { useEffect } from "react";
import { writeGuestLessonRead } from "@/lib/guest/client-storage";

type GuestLessonTrackerProps = {
  enabled: boolean;
  programId: string;
  lessonVersionId: string;
};

export default function GuestLessonTracker({
  enabled,
  programId,
  lessonVersionId,
}: GuestLessonTrackerProps) {
  useEffect(() => {
    if (!enabled) return;
    writeGuestLessonRead({ programId, lessonVersionId });
  }, [enabled, programId, lessonVersionId]);

  return null;
}
