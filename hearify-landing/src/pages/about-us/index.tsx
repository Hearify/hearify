import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import AboutUs from '@/templates/AboutUs/AboutUs';

import type { GetStaticProps, NextPage } from 'next';

const AboutUsPage: NextPage = () => {
  const pageTitle = `About Us — Hearify`;
  const pageDescription = `Learn about Hearify's mission to simplify and revolutionize the learning process through AI-powered automation. Discover our story, vision, and why Hearify is the best solution for educators and businesses.`;
  const pageKeywords = `Hearify mission, AI-powered learning, automated assessments, adaptive learning, personalized tests, AI education platform, Hearify story, automated test creation, learning technology, educational AI tools`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content={pageKeywords} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>

      <AboutUs />
    </>
  );
};

export default AboutUsPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
