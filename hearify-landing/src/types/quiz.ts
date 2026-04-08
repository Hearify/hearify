import type { Author } from '@/types/author';

export type QuizPreview = {
  slug: string;
  title: string;
  headline: string;
  description: string;
  coverUrl: string;
  appUrl: string;
  authorSlug: string;
  meta?: Record<string, string>;
};

export type Quiz = QuizPreview & {
  author: Author;
  suggestions: QuizPreview[];
  meta?: Record<string, string>;
};
