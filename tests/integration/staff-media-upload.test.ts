import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { config } from "dotenv";
import path from "node:path";

config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), ".env.local") });

import type { TenantContext } from "@/lib/tenant/context";

vi.mock("@/lib/tenant/context", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/tenant/context")>();
  return {
    ...actual,
    resolveTenantContext: vi.fn(),
  };
});

vi.mock("@/lib/cloudinary/upload", () => ({
  uploadStaffImage: vi.fn(),
}));

import { resolveTenantContext } from "@/lib/tenant/context";
import { uploadStaffImage } from "@/lib/cloudinary/upload";
import { POST } from "@/app/api/staff/media/upload/route";

const staffContext: TenantContext = {
  kind: "staff",
  userId: "staff-user",
  orgIds: [],
  isStaff: true,
};

const anonymousContext: TenantContext = {
  kind: "anonymous",
  isStaff: false,
};

function mockContext(ctx: TenantContext) {
  vi.mocked(resolveTenantContext).mockResolvedValue(ctx);
}

describe("staff media upload route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns 403 for non-staff users", async () => {
    mockContext(anonymousContext);

    const formData = new FormData();
    formData.set("file", new File(["abc"], "photo.jpg", { type: "image/jpeg" }));

    const response = await POST(
      new Request("http://test/api/staff/media/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(403);
    expect(uploadStaffImage).not.toHaveBeenCalled();
  });

  it("returns 400 when file field is missing", async () => {
    mockContext(staffContext);

    const response = await POST(
      new Request("http://test/api/staff/media/upload", {
        method: "POST",
        body: new FormData(),
      }),
    );

    expect(response.status).toBe(400);
    expect(uploadStaffImage).not.toHaveBeenCalled();
  });

  it("returns uploaded Cloudinary payload for staff", async () => {
    mockContext(staffContext);
    vi.mocked(uploadStaffImage).mockResolvedValue({
      cloudinary_url:
        "https://res.cloudinary.com/demo/image/upload/v123/arcademy/photo.jpg",
      public_id: "arcademy/photo",
      width: 800,
      height: 600,
      format: "jpg",
      bytes: 1200,
    });

    const formData = new FormData();
    formData.set("file", new File(["abc"], "photo.jpg", { type: "image/jpeg" }));
    formData.set("folder", "arcademy/programs/arcium");

    const response = await POST(
      new Request("http://test/api/staff/media/upload", {
        method: "POST",
        body: formData,
      }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({
      cloudinary_url:
        "https://res.cloudinary.com/demo/image/upload/v123/arcademy/photo.jpg",
      public_id: "arcademy/photo",
      width: 800,
      height: 600,
      format: "jpg",
      bytes: 1200,
    });
    expect(uploadStaffImage).toHaveBeenCalledWith(expect.any(File), {
      folder: "arcademy/programs/arcium",
    });
  });
});
