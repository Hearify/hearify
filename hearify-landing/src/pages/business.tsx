import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Business from '@/templates/Business/Business';

import type { GetStaticProps, NextPage } from 'next';

const BusinessPage: NextPage = () => {
  const pageTitle = `Interactive Quizzes for Business Driven by AI - Hearify`;
  const pageDescription = `Tailored AI quiz solutions for HR, education, marketing, small businesses, and specialized industries. Automate learning, track progress, and engage your audience.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>

      <Business />
    </>
  );
};

export default BusinessPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
