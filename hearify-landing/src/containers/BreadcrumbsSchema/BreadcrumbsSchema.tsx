import React from 'react';
import Head from 'next/head';

import type { BreadcrumbItem } from '@/components/AppBreadcrumbs/AppBreadcrumbs';

export type BreadcrumbsSchemaProps = {
  items: BreadcrumbItem[];
};

const BreadcrumbsSchema: React.FC<BreadcrumbsSchemaProps> = ({ items }) => {
  return (
    <Head>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: items.map((item, index) => ({
              '@type': 'ListItem',
              position: index + 1,
              name: item.text,
              item: item.href,
            })),
          }),
        }}
      />
    </Head>
  );
};

export default BreadcrumbsSchema;
