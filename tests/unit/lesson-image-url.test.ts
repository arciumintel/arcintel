import { describe, expect, it } from "vitest";
import {
  lessonImageDeliveryUrl,
  quizImageDeliveryUrl,
} from "@/lib/media/lesson-image-url";

describe("lessonImageDeliveryUrl", () => {
  const original =
    "https://res.cloudinary.com/demo/image/upload/v1234567890/arcademy/photo.jpg";

  it("inserts delivery transforms before the version segment", () => {
    expect(lessonImageDeliveryUrl(original)).toBe(
      "https://res.cloudinary.com/demo/image/upload/w_1600,c_limit,f_auto,q_auto,dpr_auto/v1234567890/arcademy/photo.jpg",
    );
  });

  it("does not double-apply transforms", () => {
    const transformed =
      "https://res.cloudinary.com/demo/image/upload/w_800,c_scale/v123/arcademy/photo.jpg";
    expect(lessonImageDeliveryUrl(transformed)).toBe(transformed);
  });

  it("uses a narrower width for quiz images", () => {
    expect(quizImageDeliveryUrl(original)).toContain("w_1344,c_limit");
  });
});
