import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Library from '@/templates/Library/Library';
import BlogService from '@/services/BlogService';
import { PAGE_SIZE } from '@/constants/page';

import type { GetServerSideProps, NextPage } from 'next';
import type { LibraryProps } from '@/templates/Library/Library';

const LibraryPage: NextPage<LibraryProps> = ({ quizzes, quizOfTheDay, page, count }) => {
  const pageTitle = `Quiz Library — Page ${page} of ${count}`;
  const pageDescription = `Learn, Play, and Challenge Yourself! It's a fun place where you can find quizzes on all kinds of topics. Whether you want to learn something new or just have a good time, we've got quizzes for you. You can test your knowledge, challenge yourself, or simply enjoy the experience. It's all about learning and having fun!`;
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

      <Library quizzes={quizzes} quizOfTheDay={quizOfTheDay} page={page} count={count} />
    </>
  );
};

export default LibraryPage;

export const getServerSideProps: GetServerSideProps<LibraryProps> = async context => {
  const page = Number(context.query.page) || 1;
  const quizzes = await BlogService.loadQuizPreviews();
  const randomQuiz = quizzes[Math.floor(Math.random() * quizzes.length)];

  return {
    props: {
      page,
      count: Math.ceil(quizzes.length / PAGE_SIZE),
      quizzes: quizzes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
      quizOfTheDay: randomQuiz,
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
