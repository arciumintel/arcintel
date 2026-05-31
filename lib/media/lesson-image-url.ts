import { LESSON_CONTENT_MAX_WIDTH_PX, LESSON_IMAGE_RECOMMENDED_WIDTH_PX } from "@/lib/media/lesson-image-spec";

const UPLOAD_MARKER = "/image/upload/";

const DEFAULT_TRANSFORM = `w_${LESSON_IMAGE_RECOMMENDED_WIDTH_PX},c_limit,f_auto,q_auto,dpr_auto`;

function hasTransformSegment(segment: string) {
  return segment.includes(",") || /^w_\d+/.test(segment);
}

/**
 * Applies Cloudinary delivery transforms for crisp lesson display without
 * mutating the stored URL. Original asset stays in Postgres; transforms are
 * applied at render time only.
 */
export function lessonImageDeliveryUrl(
  url: string,
  options?: { maxWidth?: number },
) {
  if (!url.includes("res.cloudinary.com") || !url.includes(UPLOAD_MARKER)) {
    return url;
  }

  const [base, rest] = url.split(UPLOAD_MARKER);
  if (!rest) {
    return url;
  }

  const firstSegment = rest.split("/")[0] ?? "";
  if (hasTransformSegment(firstSegment)) {
    return url;
  }

  const maxWidth = options?.maxWidth ?? LESSON_IMAGE_RECOMMENDED_WIDTH_PX;
  const transform =
    maxWidth === LESSON_IMAGE_RECOMMENDED_WIDTH_PX
      ? DEFAULT_TRANSFORM
      : `w_${maxWidth},c_limit,f_auto,q_auto,dpr_auto`;

  return `${base}${UPLOAD_MARKER}${transform}/${rest}`;
}

/** Quiz prompt images use a narrower column (`max-w-2xl` ≈ 672px). */
export function quizImageDeliveryUrl(url: string) {
  return lessonImageDeliveryUrl(url, { maxWidth: 1344 });
}

export { LESSON_CONTENT_MAX_WIDTH_PX };
