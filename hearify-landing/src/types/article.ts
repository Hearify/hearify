import type { Author } from '@/types/author';

export type FAQItem = {
  question: string;
  answer: string;
};

export type ArticlePreview = {
  slug: string;
  tag: string;
  title: string;
  headline: string;
  description: string;
  date: string;
  minutesToRead: number;
  coverUrl: string;
  authorSlug: string;
  editorSlug: string;
  faq?: FAQItem[];
  meta?: Record<string, string>;
};

export type Article = {
  slug: string;
  tag: string;
  description: string;
  coverUrl: string;
  title: string;
  headline: string;
  date: string;
  minutesToRead: number;
  faq?: FAQItem[];
  author: Author;
  editor: Author;
  suggestions: ArticlePreview[];
  meta?: Record<string, string>;
};
