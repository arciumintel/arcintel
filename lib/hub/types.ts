import type { ContentBlock } from "@/lib/content-blocks/schema";

export type HubProgramSummary = {
  slug: string;
  title: string;
  tagline: string;
  org: string;
  hubStatus: "listed" | "featured";
  featuredRank: number | null;
  lessonCount: number;
  trackCount: number;
  estimatedHours: number;
};

export type HubLessonSummary = {
  slug: string;
  title: string;
  blurb: string;
  readingMinutes: number;
  hasQuiz: boolean;
};

export type HubTrack = {
  slug: string;
  title: string;
  description: string;
  lessons: HubLessonSummary[];
};

export type HubProgramDetail = HubProgramSummary & {
  tracks: HubTrack[];
};

export type HubQuizQuestionImageView = {
  cloudinary_url: string;
  alt: string;
};

type HubQuizQuestionBase = {
  id: string;
  prompt: string;
  image?: HubQuizQuestionImageView;
};

export type HubQuizQuestionView = HubQuizQuestionBase &
  (
    | {
        type: "multiple_choice";
        options: string[];
      }
    | { type: "short_text" }
    | { type: "true_false" }
  );

export type HubQuizView = {
  passThreshold: number;
  questions: HubQuizQuestionView[];
};

export type HubLessonDetail = {
  slug: string;
  programSlug: string;
  programId: string;
  lessonVersionId: string;
  programTitle: string;
  trackSlug: string;
  trackTitle: string;
  title: string;
  blurb: string;
  readingMinutes: number;
  blocks: ContentBlock[];
  quiz: HubQuizView | null;
  navigation: {
    flat: Array<{ slug: string; title: string; trackTitle: string }>;
    index: number;
  };
};
