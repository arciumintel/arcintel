import type { ZodError } from "zod";

const FIELD_LABELS: Record<string, string> = {
  en: "text",
  text: "text",
  alt: "alt text",
  cloudinary_url: "image URL",
  language: "language",
  snippet: "code snippet",
  caption: "caption",
};

function blockTypeLabel(block: unknown, index: number) {
  const type =
    typeof block === "object" &&
    block !== null &&
    "type" in block &&
    typeof (block as { type: unknown }).type === "string"
      ? (block as { type: string }).type.replace(/_/g, " ")
      : "block";
  return `Block ${index + 1} (${type})`;
}

function fieldLabel(path: PropertyKey[]) {
  const parts = path.map(String);
  if (parts.includes("alt")) {
    return "alt text";
  }
  if (parts.includes("caption")) {
    return "caption";
  }
  if (parts.includes("cloudinary_url")) {
    return "image URL";
  }
  if (parts.includes("language")) {
    return "language";
  }
  if (parts.includes("snippet")) {
    return "code snippet";
  }
  if (parts.includes("text")) {
    return "text";
  }

  const last = parts[parts.length - 1];
  if (last && FIELD_LABELS[last]) {
    return FIELD_LABELS[last];
  }
  return parts.join(".");
}

export function formatLessonBlockSaveErrors(
  error: ZodError,
  blocks?: unknown[],
): string[] {
  return error.issues.map((issue) => {
    const path = issue.path;

    if (path[0] === "blocks" && typeof path[1] === "number") {
      const index = path[1];
      const label = blockTypeLabel(blocks?.[index], index);
      const name = fieldLabel(path.slice(2));

      if (
        issue.code === "too_small" ||
        issue.message.toLowerCase().includes("too small")
      ) {
        return `${label}: ${name} is required.`;
      }

      if (
        issue.code === "invalid_format" ||
        issue.message.toLowerCase().includes("url")
      ) {
        return `${label}: enter a valid ${name}.`;
      }

      return `${label}: ${issue.message}`;
    }

    if (path[0] === "blocks" && path.length === 1) {
      return issue.message;
    }

    return issue.message;
  });
}
