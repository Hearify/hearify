import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import SpecializedIndustries from '@/templates/BusinessSubpages/SpecializedIndustries/SpecializedIndustries';

import type { GetStaticProps, NextPage } from 'next';

const SpecializedIndustriesPage: NextPage = () => {
  const pageTitle = `Industry-Specific AI Quizzes for Training & Certification (Healthcare, Finance, Tech)`;
  const pageDescription = `AI-powered quizzes for specialized industries. Create assessments for healthcare, finance, IT, technical training, etc. Automate learning and ensure compliance.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <SpecializedIndustries />
    </>
  );
};

export default SpecializedIndustriesPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
