import { MDXRemote } from 'next-mdx-remote';
import Head from 'next/head';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';

import Article from '@/templates/Article/Article';
import BlogService from '@/services/BlogService';
import extractHeaders from '@/utils/extractHeaders';
import serializeMarkdown from '@/utils/serializeMarkdown';

import type { ArticleProps } from '@/templates/Article/Article';
import type { GetServerSideProps, NextPage } from 'next';
import type { MDXRemoteSerializeResult } from 'next-mdx-remote';

type MDXProps = {
  mdxSource: MDXRemoteSerializeResult;
};

/* eslint-disable react/jsx-props-no-spreading */
const ArticlePage: NextPage<ArticleProps & MDXProps> = ({ article, headers, mdxSource }) => {
  const pageTitle = `${article.title}`;
  const pageDescription = article.description;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta key="og:image" property="og:image" content={article.coverUrl} />

        {article.meta &&
          Object.entries(article.meta).map(([name, content]) => <meta key={name} name={name} content={content} />)}
      </Head>

      <Article article={article} headers={headers}>
        <MDXRemote {...mdxSource} />
      </Article>
    </>
  );
};

export default ArticlePage;

export const getServerSideProps: GetServerSideProps<MDXProps> = async context => {
  try {
    const slug = context.params?.slug as string;

    const mdxText = await BlogService.loadArticleMarkdown(slug);
    const mdxSource = await serializeMarkdown(mdxText);

    const article = await BlogService.loadArticle(slug);
    const headers = extractHeaders(mdxText);

    return {
      props: {
        mdxSource,
        article,
        headers,
        ...(await serverSideTranslations(String(context.locale), ['common'])),
      },
    };
  } catch {
    return {
      notFound: true,
    };
  }
};
