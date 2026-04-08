import React from 'react';
import Head from 'next/head';

import type { FAQBlockProps } from '@/containers/FAQBlock/FAQBlock';

export type FAQSchemaProps = {
  items: FAQBlockProps[];
};

const FAQSchema: React.FC<FAQSchemaProps> = ({ items }) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map(item => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          }),
        }}
      />
    </Head>
  );
};

export default FAQSchema;
