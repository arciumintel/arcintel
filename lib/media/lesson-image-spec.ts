/** Lesson player layout: `max-w-3xl` (768px). Images render full column width. */
export const LESSON_CONTENT_MAX_WIDTH_PX = 768;

/** Target width for uploads — covers 768px column at 2× retina with headroom. */
export const LESSON_IMAGE_RECOMMENDED_WIDTH_PX = 1600;

/** Comfortable default for full-width diagrams and screenshots. */
export const LESSON_IMAGE_RECOMMENDED_HEIGHT_PX = 900;

/** Minimum source width before upscaling looks soft on desktop. */
export const LESSON_IMAGE_MIN_WIDTH_PX = 1200;

export const LESSON_IMAGE_UPLOAD_HINT =
  `Images display up to ${LESSON_CONTENT_MAX_WIDTH_PX}px wide in the lesson reader. ` +
  `Upload at least ${LESSON_IMAGE_MIN_WIDTH_PX}px wide (recommended ${LESSON_IMAGE_RECOMMENDED_WIDTH_PX}×${LESSON_IMAGE_RECOMMENDED_HEIGHT_PX}px, 16:9). ` +
  "Use PNG or WebP for diagrams; JPEG for photos. Max 10 MB.";

export const QUIZ_IMAGE_UPLOAD_HINT =
  "Quiz images display up to ~672px wide. Upload at least 1200px wide (PNG/WebP for diagrams). Max 10 MB.";
