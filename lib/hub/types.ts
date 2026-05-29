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

export type HubQuizQuestionView =
  | {
      id: string;
      type: "multiple_choice";
      prompt: string;
      options: string[];
    }
  | { id: string; type: "short_text"; prompt: string }
  | { id: string; type: "true_false"; prompt: string };

export type HubQuizView = {
  passThreshold: number;
  questions: HubQuizQuestionView[];
};

export type HubLessonDetail = {
  slug: string;
  programSlug: string;
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
