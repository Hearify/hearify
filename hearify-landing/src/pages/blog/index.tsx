import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Blog from '@/templates/Blog/Blog';
import BlogService from '@/services/BlogService';
import { PAGE_SIZE } from '@/constants/page';

import type { GetServerSideProps, NextPage } from 'next';
import type { BlogProps } from '@/templates/Blog/Blog';

const BlogPage: NextPage<BlogProps> = ({ articles, page, count }) => {
  const pageTitle = `Blog — Hearify`;
  const pageDescription = `Dive into a world where artificial intelligence meets personal growth. Our blog is dedicated to providing you with engaging AI quizzes that not only test your knowledge but also enhance your learning experience. Discover insightful tips on how to maximize your study sessions, utilize AI tools for smarter learning, and continuously improve yourself.`;
  const pageKeywords = `hearify blog, ai quizzes, study tips, learning experience, ai tools, personal growth`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>

      <Blog articles={articles} page={page} count={count} />
    </>
  );
};

export default BlogPage;

export const getServerSideProps: GetServerSideProps<BlogProps> = async context => {
  const page = Number(context.query.page) || 1;
  const articles = await BlogService.loadArticlePreviews();

  return {
    props: {
      page,
      count: Math.ceil(articles.length / PAGE_SIZE),
      articles: articles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
