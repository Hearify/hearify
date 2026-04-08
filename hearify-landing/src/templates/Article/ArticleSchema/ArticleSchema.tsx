import React from 'react';
import Head from 'next/head';

import type { Article } from '@/types/article';

export type ArticleSchemaProps = {
  article: Article;
};

// TODO(Sasha): Fix date in jsons
const ArticleSchema: React.FC<ArticleSchemaProps> = ({ article }) => {
  return (
    <Head>
      <script
        key={article.slug}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            image: article.coverUrl,
            datePublished: article.date,
            author: [
              {
                '@type': 'Person',
                name: article.author.name,
                url: article.author.linkedInUrl,
              },
              {
                '@type': 'Person',
                name: article.editor.name,
                url: article.editor.linkedInUrl,
              },
            ],
          }),
        }}
      />
    </Head>
  );
};

export default ArticleSchema;
