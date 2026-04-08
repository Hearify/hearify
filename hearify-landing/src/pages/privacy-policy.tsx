import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import PrivacyPolicy from '@/templates/PrivacyPolicy/PrivacyPolicy';

import type { GetStaticProps, NextPage } from 'next';

const PrivacyPolicyPage: NextPage = () => {
  const pageTitle = `Privacy Policy for Hearify`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
      </Head>

      <PrivacyPolicy />
    </>
  );
};

export default PrivacyPolicyPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
