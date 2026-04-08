import React from 'react';
import Head from 'next/head';

import type { Quiz } from '@/types/quiz';

export type ArticleSchemaProps = {
  quiz: Quiz;
};

const QuizSchema: React.FC<ArticleSchemaProps> = ({ quiz }) => {
  return (
    <Head>
      <script
        key={quiz.slug}
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org/',
            '@type': 'Quiz',
            about: {
              '@type': 'Thing',
              name: quiz.title,
            },
          }),
        }}
      />
    </Head>
  );
};

export default QuizSchema;
