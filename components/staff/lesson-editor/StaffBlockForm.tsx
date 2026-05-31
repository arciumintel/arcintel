"use client";

import type { ContentBlock } from "@/lib/content-blocks/schema";
import StaffImageUploadField from "@/components/staff/lesson-editor/StaffImageUploadField";

const inputClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-body text-[0.98rem] text-ink outline-none transition-colors focus:border-accent";

const textareaClass =
  "mt-1.5 w-full rounded-[2px] border border-rule bg-paper-deep px-3 py-2.5 font-mono text-[0.88rem] leading-relaxed text-ink outline-none transition-colors focus:border-accent";

type StaffBlockFormProps = {
  block: ContentBlock;
  onChange: (block: ContentBlock) => void;
};

export default function StaffBlockForm({ block, onChange }: StaffBlockFormProps) {
  if (block.type === "heading") {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className="font-sans text-[0.82rem] text-ink-muted">Level</span>
          <select
            value={block.level}
            onChange={(event) =>
              onChange({
                ...block,
                level: Number(event.target.value) as 2 | 3,
              })
            }
            className={inputClass}
          >
            <option value={2}>Heading 2</option>
            <option value={3}>Heading 3</option>
          </select>
        </label>
        <label className="block">
          <span className="font-sans text-[0.82rem] text-ink-muted">
            Text (English) <span className="text-accent">*</span>
          </span>
          <input
            type="text"
            value={block.text.en}
            onChange={(event) =>
              onChange({ ...block, text: { en: event.target.value } })
            }
            className={inputClass}
          />
        </label>
      </div>
    );
  }

  if (block.type === "paragraph" || block.type === "callout") {
    return (
      <div className="space-y-4">
        {block.type === "callout" ? (
          <label className="block">
            <span className="font-sans text-[0.82rem] text-ink-muted">Variant</span>
            <select
              value={block.variant}
              onChange={(event) =>
                onChange({
                  ...block,
                  variant: event.target.value as "note" | "warning",
                })
              }
              className={inputClass}
            >
              <option value="note">Note</option>
              <option value="warning">Warning</option>
            </select>
          </label>
        ) : null}
        <label className="block">
          <span className="font-sans text-[0.82rem] text-ink-muted">
            Text (English) <span className="text-accent">*</span>
          </span>
          <textarea
            rows={4}
            value={block.text.en}
            onChange={(event) =>
              onChange({ ...block, text: { en: event.target.value } })
            }
            className={textareaClass}
          />
        </label>
      </div>
    );
  }

  if (block.type === "code") {
    return (
      <div className="space-y-4">
        <label className="block">
          <span className="font-sans text-[0.82rem] text-ink-muted">Language</span>
          <input
            type="text"
            value={block.language}
            onChange={(event) =>
              onChange({ ...block, language: event.target.value })
            }
            className={inputClass}
          />
        </label>
        <label className="block">
          <span className="font-sans text-[0.82rem] text-ink-muted">Snippet</span>
          <textarea
            rows={8}
            value={block.snippet}
            onChange={(event) =>
              onChange({ ...block, snippet: event.target.value })
            }
            className={textareaClass}
          />
        </label>
      </div>
    );
  }

  if (block.type === "image") {
    return (
      <StaffImageUploadField
        label="Image block"
        value={block.cloudinary_url}
        altValue={block.alt.en}
        onUrlChange={(cloudinary_url) => onChange({ ...block, cloudinary_url })}
        onAltChange={(en) => onChange({ ...block, alt: { en } })}
      />
    );
  }

  return (
    <p className="font-body text-body-sm text-ink-muted">
      Divider — no fields. Learners see a horizontal rule.
    </p>
  );
}
