"use client";

import { useState } from "react";
import { lessonImageDeliveryUrl } from "@/lib/media/lesson-image-url";
import { LESSON_IMAGE_UPLOAD_HINT } from "@/lib/media/lesson-image-spec";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

function altFromFilename(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim();
}

type StaffImageUploadFieldProps = {
  label: string;
  value: string;
  altValue: string;
  onUrlChange: (url: string) => void;
  onAltChange: (alt: string) => void;
  folder?: string;
  uploadHint?: string;
};

export default function StaffImageUploadField({
  label,
  value,
  altValue,
  onUrlChange,
  onAltChange,
  folder = "arcademy/staff",
  uploadHint = LESSON_IMAGE_UPLOAD_HINT,
}: StaffImageUploadFieldProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const body = new FormData();
      body.set("file", file);
      body.set("folder", folder);

      const response = await fetch("/api/staff/media/upload", {
        method: "POST",
        body,
      });

      const payload = (await response.json()) as {
        cloudinary_url?: string;
        error?: string;
      };

      if (!response.ok || !payload.cloudinary_url) {
        throw new Error(payload.error ?? "Upload failed.");
      }

      onUrlChange(payload.cloudinary_url);
      if (!altValue.trim()) {
        onAltChange(altFromFilename(file.name));
      }
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Upload failed.",
      );
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <p className="font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-soft">
        {label}
      </p>
      <p className="rounded-sm border border-rule bg-paper-shade px-4 py-3 font-body text-[0.85rem] leading-relaxed text-ink-muted">
        {uploadHint}
      </p>
      {value ? (
        <figure className="overflow-hidden rounded-sm border border-rule bg-paper-shade">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lessonImageDeliveryUrl(value)}
            alt={altValue || "Uploaded"}
            className="max-h-72 w-full object-contain"
          />
        </figure>
      ) : null}
      <label className="block">
        <span className="font-sans text-[0.82rem] text-ink-muted">Upload image</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          disabled={uploading}
          onChange={handleFileChange}
          className="mt-1 block w-full font-body text-[0.85rem] text-ink-muted file:mr-3 file:rounded-sm file:border-0 file:bg-accent file:px-3 file:py-1.5 file:font-sans file:text-[0.82rem] file:text-accent-on"
        />
      </label>
      <label className="block">
        <span className="font-sans text-[0.82rem] text-ink-muted">Image URL</span>
        <input
          type="url"
          value={value}
          onChange={(event) => onUrlChange(event.target.value)}
          className={inputClass}
          placeholder="https://res.cloudinary.com/…"
        />
      </label>
      <label className="block">
        <span className="font-sans text-[0.82rem] text-ink-muted">
          Alt text (English) <span className="text-accent">*</span>
        </span>
        <input
          type="text"
          value={altValue}
          onChange={(event) => onAltChange(event.target.value)}
          className={inputClass}
          required
          placeholder="Describe the image for screen readers"
        />
      </label>
      {error ? (
        <p className="font-body text-[0.85rem] text-error" role="alert">
          {error}
        </p>
      ) : null}
      {uploading ? (
        <p className="font-mono text-[0.72rem] text-ink-soft">Uploading…</p>
      ) : null}
    </div>
  );
}
