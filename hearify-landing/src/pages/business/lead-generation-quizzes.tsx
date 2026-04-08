import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import MarketingEngagement from '@/templates/BusinessSubpages/MarketingEngagement/MarketingEngagement';

import type { GetStaticProps, NextPage } from 'next';

const MarketingEngagementPage: NextPage = () => {
  const pageTitle = `AI Quizzes for Marketing, Lead Generation & Customer Retention`;
  const pageDescription = `Transform customer interactions with AI quizzes! Automate lead generation and create engaging marketing campaigns that drive real results.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <MarketingEngagement />
    </>
  );
};

export default MarketingEngagementPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
