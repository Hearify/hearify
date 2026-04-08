import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import styles from './ArticleCard.module.scss';

import type { ArticlePreview } from '@/types/article';

export type ArticleCardProps = {
  article: ArticlePreview;
};

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const topicUrl = `/blog/${article.slug}`;

  return (
    <div className={styles.wrapper}>
      <Link href={topicUrl}>
        <Image src={article.coverUrl} alt={article.headline} width={320} height={230} className={styles.image} />
      </Link>

      <div className={styles.container}>
        <div className={styles.header}>
          <span className={styles.section}>{article.tag}</span>
          <span className={styles.minutes}>{article.minutesToRead} min read</span>
        </div>

        <div className={styles.body}>
          <Link href={topicUrl} className={styles.link}>
            <h4 className={styles.title}>{article.headline}</h4>
            <p className={styles.description}>{article.description}</p>
          </Link>

          <div className={styles.footer}>
            <div className={styles.date}>{article.date}</div>
            <AppButtonLink href={topicUrl} size="sm" variant="secondary">
              READ MORE
            </AppButtonLink>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleCard;
