import Head from 'next/head';
import { useRouter } from 'next/router';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useMemo } from 'react';
import { useTranslation } from 'next-i18next';

import Home from '@/templates/Home/Home';

import type { GetStaticProps, NextPage } from 'next';

const HomePage: NextPage = () => {
  const { t } = useTranslation('common', { keyPrefix: 'pages.HomePage' });

  const router = useRouter();

  const canonicalUrl = useMemo<string>(() => {
    if (router.locale === 'en-CA') return 'https://ca.hearify.org';
    if (router.locale === 'en-AU') return 'https://au.hearify.org';
    if (router.locale === 'en-GB') return 'https://uk.hearify.org';
    if (router.locale === 'uk') return 'https://ua.hearify.org';
    return 'https://hearify.org';
  }, [router.locale]);

  return (
    <>
      <Head>
        <title>{t('title')}</title>
        <meta name="description" content={t('description')} />
        <meta property="og:title" content={t('title')} />
        <meta property="og:description" content={t('description')} />
        <link rel="canonical" href={canonicalUrl} />
      </Head>

      <Home />
    </>
  );
};

export default HomePage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
