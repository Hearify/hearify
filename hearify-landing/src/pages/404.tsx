import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import PageNotFound from '@/templates/PageNotFound/PageNotFound';

import type { GetStaticProps, NextPage } from 'next';

const NotFoundPage: NextPage = () => {
  const pageTitle = `Page Not Found`;
  const pageDescription = `The page you’re looking for may have been moved, deleted, or the URL might be incorrect. While this content
          isn't available, your next quiz is just a click away.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>

      <PageNotFound />
    </>
  );
};

export default NotFoundPage;

export const getStaticProps: GetStaticProps = async context => ({
  props: {
    ...(await serverSideTranslations(String(context.locale), ['common'])),
  },
});
