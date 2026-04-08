import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Agencies from '@/templates/BusinessSubpages/Agencies/Agencies';

import type { GetStaticProps, NextPage } from 'next';

const AgenciesPage: NextPage = () => {
  const pageTitle = `Grow Your Agency with White-Label AI Quiz Solutions (Customizable & Scalable)`;
  const pageDescription = `Unlock new revenue streams with our Partner Program. Customize, resell, and grow your business with AI-powered quiz solutions.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <Agencies />
    </>
  );
};

export default AgenciesPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
