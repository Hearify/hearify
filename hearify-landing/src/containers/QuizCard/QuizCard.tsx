import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

import styles from './QuizCard.module.scss';

import type { QuizPreview } from '@/types/quiz';

export type QuizCardProps = {
  quiz: QuizPreview;
};

const QuizCard: React.FC<QuizCardProps> = ({ quiz }) => {
  const topicUrl = `/library/${quiz.slug}`;

  return (
    <div className={styles.wrapper}>
      <Link href={quiz.appUrl}>
        <Image src={quiz.coverUrl} alt={quiz.title} width={320} height={230} className={styles.image} />
      </Link>

      <div className={styles.container}>
        <div className={styles.body}>
          <Link href={topicUrl} className={styles.link}>
            <h4 className={styles.title}>{quiz.headline}</h4>
            <p className={styles.description}>{quiz.description}</p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
