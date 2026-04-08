import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import SMBSolutions from '@/templates/BusinessSubpages/SMBSolutions/SMBSolutions';

import type { GetStaticProps, NextPage } from 'next';

const SMBSolutionsPage: NextPage = () => {
  const pageTitle = `Interactive Quizzes for Small Businesses & Startups (Easy & Scalable)`;
  const pageDescription = `Empower your small business & startups with AI quizzes for training, onboarding, and engagement. Simple, cost-effective, and easy to use.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <SMBSolutions />
    </>
  );
};

export default SMBSolutionsPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
