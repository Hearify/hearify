import fs from 'fs';
import path from 'path';

import type { Author } from '@/types/author';
import type { Article, ArticlePreview } from '@/types/article';
import type { Quiz, QuizPreview } from '@/types/quiz';

const contentDir = path.join(process.cwd(), 'content');

class BlogService {
  public static loadArticlePreviews = async (): Promise<ArticlePreview[]> => {
    const file = fs.readFileSync(path.join(contentDir, 'articles.json'), 'utf-8');
    return JSON.parse(file);
  };

  public static loadQuizPreviews = async (): Promise<QuizPreview[]> => {
    const file = fs.readFileSync(path.join(contentDir, 'quizzes.json'), 'utf-8');
    return JSON.parse(file);
  };

  public static loadAuthors = async (): Promise<Author[]> => {
    const file = fs.readFileSync(path.join(contentDir, 'authors.json'), 'utf-8');
    return JSON.parse(file);
  };

  public static loadArticleMarkdown = async (slug: string): Promise<string> => {
    const file = fs.readFileSync(path.join(contentDir, 'articles', `${slug}.mdx`), 'utf-8');
    return file;
  };

  public static loadQuizMarkdown = async (slug: string): Promise<string> => {
    const file = fs.readFileSync(path.join(contentDir, 'quizzes', `${slug}.md`), 'utf-8');
    return file;
  };

  public static loadAuthor = async (slug: string): Promise<Author> => {
    const authors = await BlogService.loadAuthors();
    const author = authors.find(item => item.slug === slug);

    if (!author) {
      throw new Error(`Author with slug ${slug} not found`);
    }

    return author;
  };

  public static loadArticle = async (slug: string): Promise<Article> => {
    const articles = await BlogService.loadArticlePreviews();
    const article = articles.find(item => item.slug === slug);

    if (!article) {
      throw new Error(`Article with slug ${slug} not found`);
    }

    const author = await BlogService.loadAuthor(article.authorSlug);
    const editor = await BlogService.loadAuthor(article.editorSlug);
    const suggestions = articles
      .filter(item => item.slug !== slug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return {
      ...article,
      author,
      editor,
      suggestions,
    };
  };

  public static loadQuiz = async (slug: string): Promise<Quiz> => {
    const quizzes = await BlogService.loadQuizPreviews();
    const quiz = quizzes.find(item => item.slug === slug);

    if (!quiz) {
      throw new Error(`Quiz with slug ${slug} not found`);
    }

    const author = await BlogService.loadAuthor(quiz.authorSlug);
    const suggestions = quizzes
      .filter(item => item.slug !== slug)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    return {
      ...quiz,
      author,
      suggestions,
    };
  };
}

export default BlogService;
