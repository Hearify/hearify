import React from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';

import GroupImg from '@/assets/images/blog-group.png';
import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import AppHeading from '@/components/AppHeading/AppHeading';
import ArticleCard from '@/containers/ArticleCard/ArticleCard';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import BlogHeroImg from '@/assets/images/blog-hero.png';
import styles from './Blog.module.scss';
import AppPagination from '@/components/AppPagination/AppPagination';

import type { ArticlePreview } from '@/types/article';

export type BlogProps = {
  articles: ArticlePreview[];
  page: number;
  count: number;
};

const Blog: React.FC<BlogProps> = ({
  articles, //
  page,
  count,
}) => {
  const { t } = useTranslation();

  const router = useRouter();

  const handlePageChange = async (newPage: number): Promise<void> => {
    await router.push(
      {
        pathname: router.pathname,
        query: { ...router.query, page: newPage },
      },
      undefined,
      { scroll: true },
    );
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <AppHeading className={styles.heroTitle} variant="h2">
            {t('welcome_to_blog')}
          </AppHeading>
          <p className={styles.heroText}>{t('blog_description')}</p>
          <AppButtonLink className={styles.heroButton} href="https://app.hearify.org/signup" size="lg" width="240px">
            {t('try_for_free')}
          </AppButtonLink>
        </div>

        <Image src={BlogHeroImg} alt="AI robot" className={styles.heroImage} width={700} height={500} />
      </div>

      <div className={styles.topics}>
        <AppHeading variant="h2" className={styles.topicsTitle}>
          {t('articles')}
        </AppHeading>

        <div className={styles.list}>
          {articles.map(item => (
            <ArticleCard key={item.slug} article={item} />
          ))}
        </div>

        <AppPagination page={page} count={count} onChange={handlePageChange} />
      </div>

      <BoostAlert
        title={t('boost_your_knowledge')}
        text={t('try_out_ai_quiz')}
        button={t('try_for_free')}
        image={GroupImg}
        width={360}
        height={300}
      />
    </div>
  );
};

export default Blog;
