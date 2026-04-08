import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Pricing from '@/templates/Pricing/Pricing';

import type { GetStaticProps, NextPage } from 'next';

const PricingPage: NextPage = () => {
  const pageTitle = `Pricing — Hearify`;
  const pageDescription = `We’d love to hear from you! Whether you have general questions, business inquiries, or need media support, our team at Hearify is here to assist. Get in touch with us via email or follow us on social media for updates and support.`;
  const pageKeywords = `hearify contact, general inquiries, business inquiries, media inquiries, customer support, follow us`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>

      <Pricing />
    </>
  );
};

export default PricingPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
