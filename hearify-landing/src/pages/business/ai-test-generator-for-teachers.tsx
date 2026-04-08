import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import EduInstitutions from '@/templates/BusinessSubpages/EduInstitutions/EduInstitutions';

import type { GetStaticProps, NextPage } from 'next';

const EduInstitutionsPage: NextPage = () => {
  const pageTitle = `AI Quiz Generator for Teachers (Schools, Universities, and Online Courses)`;
  const pageDescription = `AI quiz maker for teachers: Automate test creation, track student progress, and improve engagement in schools, universities, and online courses.`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
      </Head>
      <EduInstitutions />
    </>
  );
};

export default EduInstitutionsPage;

export const getStaticProps: GetStaticProps = async context => {
  return {
    props: {
      ...(await serverSideTranslations(String(context.locale), ['common'])),
    },
  };
};
