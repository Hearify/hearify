import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';

import GroupImg from '@/assets/images/blog-group.png';
import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import AppHeading from '@/components/AppHeading/AppHeading';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import QuizCard from '@/containers/QuizCard/QuizCard';
import AppPagination from '@/components/AppPagination/AppPagination';
import styles from './Library.module.scss';

import type { QuizPreview } from '@/types/quiz';

export type LibraryProps = {
  quizzes: QuizPreview[];
  quizOfTheDay: QuizPreview;
  page: number;
  count: number;
};

const Library: React.FC<LibraryProps> = ({ quizzes, quizOfTheDay, page, count }) => {
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
            {t('welcome_to_library')}
          </AppHeading>
          <p className={styles.heroText}>{t('library_description')}</p>
          <AppButtonLink className={styles.heroButton} href="https://app.hearify.org/signup" size="lg" width="240px">
            {t('try_for_free')}
          </AppButtonLink>
        </div>

        <div className={styles.quiz}>
          <span className={styles.quizTag}>{t('recommended_for_you')}</span>

          <Link href={quizOfTheDay.appUrl}>
            <Image
              src={quizOfTheDay.coverUrl}
              alt={quizOfTheDay.title}
              className={styles.quizImage}
              width={600}
              height={500}
            />
          </Link>

          <div className={styles.quizContent}>
            <div className={styles.quizBackground}>
              <h4 className={styles.quizTitle}>{quizOfTheDay.title}</h4>
              <p className={styles.quizDescription}>{quizOfTheDay.description}</p>
              <AppButtonLink className={styles.quizButton} href={quizOfTheDay.appUrl} size="lg" width="240px">
                {t('start_quiz')}
              </AppButtonLink>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.topics}>
        <AppHeading variant="h2" className={styles.topicsTitle}>
          {t('all_quizzes')}
        </AppHeading>

        <div className={styles.list}>
          {quizzes.map(item => (
            <QuizCard key={item.slug} quiz={item} />
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

export default Library;
