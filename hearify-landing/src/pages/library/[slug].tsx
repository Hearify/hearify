import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import BlogService from '@/services/BlogService';
import Quiz from '@/templates/Quiz/Quiz';
import serializeMarkdown from '@/utils/serializeMarkdown';

import type { QuizProps } from '@/templates/Quiz/Quiz';
import type { GetServerSideProps, NextPage } from 'next';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

type MDXProps = {
  mdxSource: MDXRemoteSerializeResult;
};

/* eslint-disable react/jsx-props-no-spreading */
const QuizPage: NextPage<QuizProps & MDXProps> = ({ quiz, mdxSource }) => {
  const pageTitle = `${quiz.title}`;
  const pageDescription = quiz.description;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta key="og:image" property="og:image" content={quiz.coverUrl} />

        {quiz.meta &&
          Object.entries(quiz.meta).map(([name, content]) => <meta key={name} name={name} content={content} />)}
      </Head>

      <Quiz quiz={quiz}>
        <MDXRemote {...mdxSource} />
      </Quiz>
    </>
  );
};

export default QuizPage;

export const getServerSideProps: GetServerSideProps<MDXProps> = async context => {
  try {
    const slug = context.params?.slug as string;

    const mdxText = await BlogService.loadQuizMarkdown(slug);
    const mdxSource = await serializeMarkdown(mdxText);

    const quiz = await BlogService.loadQuiz(slug);

    return {
      props: {
        mdxSource,
        quiz,
        ...(await serverSideTranslations(String(context.locale), ['common'])),
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
