import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTranslation } from 'next-i18next';

import GroupImg from '@/assets/images/blog-group.png';
import AppBreadcrumbs from '@/components/AppBreadcrumbs/AppBreadcrumbs';
import AuthorCard from '@/containers/AuthorCard/AuthorCard';
import styles from './Quiz.module.scss';
import BoostAlert from '@/containers/BoostAlert/BoostAlert';
import QuizCard from '@/containers/QuizCard/QuizCard';
import AppHeading from '@/components/AppHeading/AppHeading';
import AppButtonLink from '@/components/AppButtonLink/AppButtonLink';
import QuizSchema from '@/templates/Quiz/QuizSchema/QuizSchema';

import type { Quiz as QuizType } from '@/types/quiz';

export type QuizProps = {
  quiz: QuizType;
  children: React.ReactNode;
};

const Quiz: React.FC<QuizProps> = ({ quiz, children }) => {
  const { t } = useTranslation();

  return (
    <div className={styles.wrapper}>
      <QuizSchema quiz={quiz} />

      <div className={styles.main}>
        <article className={styles.body}>
          <AppBreadcrumbs
            items={[
              { text: t('library'), href: '/library' },
              { text: quiz.headline, href: `/library/${quiz.slug}` },
            ]}
          />

          <div className={styles.authors}>
            {/* eslint-disable jsx-a11y/aria-role */}
            <AuthorCard author={quiz.author} role="author" />
          </div>

          <div className={styles.header}>
            <h1 className={styles.title}>{quiz.headline}</h1>
          </div>

          <div className={styles.content}>
            <div className={styles.popup}>
              <Link href={quiz.appUrl}>
                <Image src={quiz.coverUrl} alt={quiz.title} width={800} height={500} className={styles.popupImage} />
              </Link>

              <div className={styles.popupContainer}>
                <div className={styles.popupBackground}>
                  <h4 className={styles.popupTitle}>{quiz.headline}</h4>
                  <AppButtonLink href={quiz.appUrl} size="lg" className={styles.popupButton}>
                    {t('start_quiz')}
                  </AppButtonLink>
                </div>
              </div>
            </div>

            {children}
          </div>
        </article>
      </div>

      <BoostAlert
        title={t('boost_your_knowledge')}
        text={t('try_out_ai_quiz')}
        button={t('try_for_free')}
        image={GroupImg}
        width={360}
        height={300}
      />

      <div className={styles.suggestions}>
        <AppHeading variant="h2">{t('related_quizzes')}</AppHeading>

        <div className={styles.suggestionsList}>
          {quiz.suggestions.map(item => (
            <QuizCard key={item.slug} quiz={item} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
