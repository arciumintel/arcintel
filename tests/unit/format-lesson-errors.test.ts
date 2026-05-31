import { describe, expect, it } from "vitest";
import { saveDraftLessonBlocksSchema } from "@/lib/validation/staff-lesson";
import { formatLessonBlockSaveErrors } from "@/lib/validation/format-lesson-errors";

describe("formatLessonBlockSaveErrors", () => {
  it("maps empty image alt to a readable message", () => {
    const blocks = [
      {
        type: "image",
        cloudinary_url:
          "https://res.cloudinary.com/demo/image/upload/v1/arcademy/photo.jpg",
        alt: { en: "" },
      },
    ];

    const parsed = saveDraftLessonBlocksSchema.safeParse({ blocks });
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const messages = formatLessonBlockSaveErrors(parsed.error, blocks);
      expect(messages[0]).toContain("Block 1 (image)");
      expect(messages[0]).toContain("alt text is required");
    }
  });
});
