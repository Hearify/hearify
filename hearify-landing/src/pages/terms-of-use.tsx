import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import TermsOfUse from '@/templates/TermsOfUse/TermsOfUse';

import type { GetStaticProps, NextPage } from 'next';

const TermsOfUsePage: NextPage = () => {
  const pageTitle = `Terms of Use for Hearify`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
      </Head>

      <TermsOfUse />
    </>
  );
};

export default TermsOfUsePage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
