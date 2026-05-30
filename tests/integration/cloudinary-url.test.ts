import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import { isAllowedCloudinaryUrl } from "@/lib/media/cloudinary-url";

describe("cloudinary url allowlist", () => {
  const previousUrl = process.env.CLOUDINARY_URL;

  beforeEach(() => {
    process.env.CLOUDINARY_URL = "cloudinary://key:secret@do4ef2cvz";
  });

  afterEach(() => {
    process.env.CLOUDINARY_URL = previousUrl;
  });

  it("accepts HTTPS URLs for the configured cloud", () => {
    expect(
      isAllowedCloudinaryUrl(
        "https://res.cloudinary.com/do4ef2cvz/image/upload/v123/arcademy/photo.jpg",
      ),
    ).toBe(true);
  });

  it("rejects other cloud names", () => {
    expect(
      isAllowedCloudinaryUrl(
        "https://res.cloudinary.com/demo/image/upload/v123/sample.jpg",
      ),
    ).toBe(false);
  });

  it("rejects non-HTTPS URLs", () => {
    expect(
      isAllowedCloudinaryUrl(
        "http://res.cloudinary.com/do4ef2cvz/image/upload/v123/photo.jpg",
      ),
    ).toBe(false);
  });
});
