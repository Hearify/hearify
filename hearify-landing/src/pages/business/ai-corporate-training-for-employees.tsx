import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import CorporateTraining from '@/templates/BusinessSubpages/CorporateTraining/CorporateTraining';

import type { GetStaticProps, NextPage } from 'next';

const CorporateTrainingPage: NextPage = () => {
  const pageTitle = `AI Employee Training Made Easy: Automate Corporate Training`;
  const pageDescription = `Improve corporate training with AI-powered tests. Automate training, track progress, and create interactive content to adapt and upskill employees.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <CorporateTraining />
    </>
  );
};

export default CorporateTrainingPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
